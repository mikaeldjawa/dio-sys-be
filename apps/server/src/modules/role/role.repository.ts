import { db } from "@dio-sys-be/db";
import { permissions, rolePermissions, roles } from "@dio-sys-be/db/schema";
import { eq } from "drizzle-orm";

export const findAllRoles = async () => {
  return await db.select().from(roles);
};

export const findRolesByTenantId = async (tenantId: string) => {
  return await db.select().from(roles).where(eq(roles.tenantId, tenantId));
};

export const findRoleById = async (id: string) => {
  const role = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role[0]) return null;

  const perms = await db
    .select({ id: permissions.id, name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));

  return {
    ...role[0],
    permissions: perms,
  };
};

export const createRole = async (data: {
  tenantId: string;
  name: string;
  scope: "GLOBAL" | "TENANT";
}) => {
  const result = await db.insert(roles).values(data).returning();
  return result[0];
};

export const updateRole = async (
  id: string,
  data: { name?: string; scope?: "GLOBAL" | "TENANT" },
) => {
  const result = await db
    .update(roles)
    .set(data)
    .where(eq(roles.id, id))
    .returning();
  return result[0] || null;
};

export const deleteRole = async (id: string) => {
  const result = await db.delete(roles).where(eq(roles.id, id)).returning();
  return result[0] || null;
};

export const syncRolePermissions = async (
  roleId: string,
  permissionIds: string[],
  tx?: any,
) => {
  const dbInstance = tx || db;

  await dbInstance
    .delete(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  if (permissionIds.length > 0) {
    const values = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));
    await dbInstance.insert(rolePermissions).values(values);
  }
};
