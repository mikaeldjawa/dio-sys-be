import { AppError } from "@/utils/app-error";
import { db } from "@dio-sys-be/db";
import { env } from "@dio-sys-be/env/server";
import bcrypt from "bcrypt";
import { jwtVerify, SignJWT } from "jose";
import * as authRepo from "./auth.repository";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from "./auth.schema";

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const generateRandomSuffix = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const register = async (input: RegisterInput) => {
  const emailExists = await authRepo.findUserByEmail(input.email);
  if (emailExists) {
    throw new AppError("Email already registered", 409);
  }

  let slug = generateSlug(input.tenantName);
  let slugExists = await authRepo.findTenantBySlug(slug);
  let retries = 0;

  while (slugExists && retries < 3) {
    slug = `${generateSlug(input.tenantName)}-${generateRandomSuffix(4)}`;
    slugExists = await authRepo.findTenantBySlug(slug);
    retries++;
  }

  if (slugExists) {
    throw new AppError(
      "Unable to create tenant, please try a different name",
      409,
    );
  }

  return await db.transaction(async (tx) => {
    const tenant = await authRepo.createTenant(
      { name: input.tenantName, slug },
      tx,
    );

    const role = await authRepo.createRole(
      { tenantId: tenant.id, name: "Admin", scope: "TENANT" },
      tx,
    );

    const allPermissions = await authRepo.findAllPermissions(tx);
    if (allPermissions.length === 0) {
      throw new AppError("System permissions not configured", 500);
    }

    const GLOBAL_ONLY_PERMISSIONS = new Set([
      "tenant:list",
      "tenant:create",
      "tenant:update",
      "tenant:delete",
      "role:list",
      "role:create",
      "role:update",
      "role:delete",
      "permission:list",
      "permission:create",
      "permission:update",
      "permission:delete",
      "user:list",
      "user:create",
      "user:update",
      "user:delete",
    ]);

    const tenantPermissions = allPermissions.filter(
      (perm) => !GLOBAL_ONLY_PERMISSIONS.has(perm.name),
    );

    const rolePermissionRows = tenantPermissions.map((perm) => ({
      roleId: role.id,
      permissionId: perm.id,
    }));

    await authRepo.createRolePermissions(rolePermissionRows, tx);

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await authRepo.createUser(
      {
        tenantId: tenant.id,
        roleId: role.id,
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
      tx,
    );

    return {
      userId: user.id,
      tenantId: tenant.id,
    };
  });
};

export const login = async (input: LoginInput) => {
  const user = await authRepo.findUserByEmail(input.email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const tenant = await authRepo.findTenantById(user.tenantId);
  if (!tenant) {
    throw new AppError("Account configuration error", 500);
  }

  const roleWithPermissions = await authRepo.findRoleWithPermissions(
    user.roleId,
  );
  if (!roleWithPermissions) {
    throw new AppError("Account configuration error", 500);
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const accessToken = await new SignJWT({
    sub: user.id,
    tenantId: tenant.id,
    scope: roleWithPermissions.scope,
    permissions: roleWithPermissions.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);

  const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
  const refreshToken = await new SignJWT({
    sub: user.id,
    tenantId: tenant.id,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(refreshSecret);

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (input: RefreshTokenInput) => {
  const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

  let payload;
  try {
    const { payload: verifiedPayload } = await jwtVerify(
      input.refreshToken,
      refreshSecret,
    );
    payload = verifiedPayload;
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (payload.type !== "refresh") {
    throw new AppError("Invalid token type", 401);
  }

  const userId = payload.sub as string;
  const tenantId = payload.tenantId as string;

  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const tenant = await authRepo.findTenantById(tenantId);
  if (!tenant) {
    throw new AppError("Account configuration error", 500);
  }

  const roleWithPermissions = await authRepo.findRoleWithPermissions(
    user.roleId,
  );
  if (!roleWithPermissions) {
    throw new AppError("Account configuration error", 500);
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const accessToken = await new SignJWT({
    sub: user.id,
    tenantId: tenant.id,
    scope: roleWithPermissions.scope,
    permissions: roleWithPermissions.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);

  const newRefreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
  const newRefreshToken = await new SignJWT({
    sub: user.id,
    tenantId: tenant.id,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(newRefreshSecret);

  return { accessToken, refreshToken: newRefreshToken };
};
