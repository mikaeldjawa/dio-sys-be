import type { UserContext } from "@/types/user-context";
import { AppError } from "@/utils/app-error";
import { assertPermission, assertTenantMatch } from "@/utils/assert-permission";
import bcrypt from "bcrypt";
import * as roleRepo from "../role/role.repository";
import * as tenantRepo from "../tenant/tenant.repository";
import * as userRepo from "./user.repository";
import type { CreateUserInput, UpdateUserInput } from "./user.schema";

export const listUsers = async (ctx: UserContext) => {
  const permission = ctx.scope === "GLOBAL" ? "user:list" : "user:view";
  assertPermission(ctx, permission);

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    return await userRepo.findUsersByTenantId(ctx.tenantId);
  }

  return await userRepo.findAllUsers();
};

export const getUsersByTenant = async (ctx: UserContext, tenantId: string) => {
  const permission = ctx.scope === "GLOBAL" ? "user:list" : "user:view";
  assertPermission(ctx, permission);

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    if (ctx.tenantId !== tenantId) {
      throw new AppError("You do not have access to this tenant", 403);
    }
  }

  const tenant = await tenantRepo.findTenantById(tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  return await userRepo.findUsersByTenantId(tenantId);
};

export const getUser = async (ctx: UserContext, id: string) => {
  const permission = ctx.scope === "GLOBAL" ? "user:list" : "user:view";
  assertPermission(ctx, permission);

  const user = await userRepo.findUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, user.tenantId);
  }

  return user;
};

export const createUser = async (ctx: UserContext, input: CreateUserInput) => {
  const permission = ctx.scope === "GLOBAL" ? "user:create" : "user:manage";
  assertPermission(ctx, permission);

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    if (input.tenantId !== ctx.tenantId) {
      throw new AppError("You can only create users in your own tenant", 403);
    }
  }

  const tenant = await tenantRepo.findTenantById(input.tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  const role = await roleRepo.findRoleById(input.roleId);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (ctx.scope === "TENANT" && role.tenantId !== ctx.tenantId) {
    throw new AppError("Role does not belong to your tenant", 403);
  }

  const existingUser = await userRepo.findUserByEmail(input.email);
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  return await userRepo.createUser({
    tenantId: input.tenantId,
    roleId: input.roleId,
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });
};

export const updateUser = async (
  ctx: UserContext,
  id: string,
  input: UpdateUserInput,
) => {
  const permission = ctx.scope === "GLOBAL" ? "user:update" : "user:manage";
  assertPermission(ctx, permission);

  const user = await userRepo.findUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, user.tenantId);
  }

  if (input.roleId) {
    const role = await roleRepo.findRoleById(input.roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }
    if (ctx.scope === "TENANT" && role.tenantId !== ctx.tenantId) {
      throw new AppError("Role does not belong to your tenant", 403);
    }
  }

  if (input.email) {
    const existing = await userRepo.findUserByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new AppError("Email already in use", 409);
    }
  }

  const updateData: {
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
  } = {
    name: input.name,
    email: input.email,
    roleId: input.roleId,
  };

  if (input.password) {
    updateData.password = await bcrypt.hash(input.password, 12);
  }

  return await userRepo.updateUser(id, updateData);
};

export const deleteUser = async (ctx: UserContext, id: string) => {
  const permission = ctx.scope === "GLOBAL" ? "user:delete" : "user:manage";
  assertPermission(ctx, permission);

  const user = await userRepo.findUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, user.tenantId);
  }

  return await userRepo.deleteUser(id);
};
