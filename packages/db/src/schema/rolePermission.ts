import { pgTable, uuid } from "drizzle-orm/pg-core";

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("id"),
  permissionId: uuid("permission"),
});
