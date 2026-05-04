import { db } from "@dio-sys-be/db";
import {
  permissions,
  rolePermissions,
  roles,
  tenants,
  users,
} from "@dio-sys-be/db/schema";
import { eq } from "drizzle-orm";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type RoleWithPermissions = {
  id: string;
  tenantId: string;
  name: string;
  scope: "GLOBAL" | "TENANT";
  createdAt: string | Date;
  permissions: string[];
};

export const findUserByEmail = async (email: string) => {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });
};

export const findUserById = async (id: string) => {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
  });
};

export const findTenantBySlug = async (slug: string) => {
  return db.query.tenants.findFirst({
    where: (tenant, { eq }) => eq(tenant.slug, slug),
  });
};

export const createTenant = async (
  data: { name: string; slug: string },
  tx: Transaction,
) => {
  const [tenant] = await tx.insert(tenants).values(data).returning();
  if (!tenant) {
    throw new Error("Failed to create tenant");
  }
  return tenant;
};

export const createRole = async (
  data: { tenantId: string; name: string; scope: "GLOBAL" | "TENANT" },
  tx: Transaction,
) => {
  const [role] = await tx.insert(roles).values(data).returning();
  if (!role) {
    throw new Error("Failed to create role");
  }
  return role;
};

export const findAllPermissions = async (tx: Transaction) => {
  return tx.select().from(permissions);
};

export const createRolePermissions = async (
  rows: { roleId: string; permissionId: string }[],
  tx: Transaction,
) => {
  if (rows.length === 0) return;
  await tx.insert(rolePermissions).values(rows);
};

export const createUser = async (
  data: {
    tenantId: string;
    roleId: string;
    name: string;
    email: string;
    password: string;
  },
  tx: Transaction,
) => {
  const [user] = await tx.insert(users).values(data).returning();
  if (!user) {
    throw new Error("Failed to create user");
  }
  return user;
};

export const findTenantById = async (id: string) => {
  return db.query.tenants.findFirst({
    where: (tenant, { eq }) => eq(tenant.id, id),
  });
};

export const findRoleWithPermissions = async (
  roleId: string,
): Promise<RoleWithPermissions | null> => {
  const role = await db.query.roles.findFirst({
    where: (r, { eq }) => eq(r.id, roleId),
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  if (!role) return null;

  const permissionNames = role.rolePermissions.map((rp) => rp.permission.name as string);

  return {
    id: role.id,
    tenantId: role.tenantId,
    name: role.name,
    scope: role.scope,
    createdAt: role.createdAt,
    permissions: permissionNames,
  };
};

export const updateUserRefreshToken = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date,
) => {
  const [user] = await db
    .update(users)
    .set({
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId))
    .returning();

  return user;
};

export const findUserByRefreshToken = async (refreshToken: string) => {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.refreshToken, refreshToken),
  });
};

export const clearUserRefreshToken = async (userId: string) => {
  await db
    .update(users)
    .set({
      refreshToken: null,
      refreshTokenExpiresAt: null,
    })
    .where(eq(users.id, userId));
};
