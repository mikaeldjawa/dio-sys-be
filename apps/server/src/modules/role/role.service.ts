import { GLOBAL_ONLY_PERMISSIONS } from "@/constants/permissions";
import type { UserContext } from "@/types/user-context";
import { AppError } from "@/utils/app-error";
import { assertPermission, assertTenantMatch } from "@/utils/assert-permission";
import { db } from "@dio-sys-be/db";
import * as permissionRepo from "../permission/permission.repository";
import * as tenantRepo from "../tenant/tenant.repository";
import * as roleRepo from "./role.repository";
import type { CreateRoleInput, UpdateRoleInput } from "./role.schema";

export const listRoles = async (ctx: UserContext) => {
  const permission = ctx.scope === "GLOBAL" ? "role:list" : "role:view";
  assertPermission(ctx, permission);

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    return await roleRepo.findRolesByTenantId(ctx.tenantId);
  }

  return await roleRepo.findAllRoles();
};

export const getRolesByTenant = async (ctx: UserContext, tenantId: string) => {
  const permission = ctx.scope === "GLOBAL" ? "role:list" : "role:view";
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

  return await roleRepo.findRolesByTenantId(tenantId);
};

export const getRole = async (ctx: UserContext, id: string) => {
  const permission = ctx.scope === "GLOBAL" ? "role:list" : "role:view";
  assertPermission(ctx, permission);

  const role = await roleRepo.findRoleById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, role.tenantId);
  }

  return role;
};

export const createRole = async (ctx: UserContext, input: CreateRoleInput) => {
  const permission = ctx.scope === "GLOBAL" ? "role:create" : "role:manage";
  assertPermission(ctx, permission);

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    if (input.tenantId !== ctx.tenantId) {
      throw new AppError("You can only create roles in your own tenant", 403);
    }
    if (input.scope === "GLOBAL") {
      throw new AppError("TENANT users cannot create GLOBAL-scoped roles", 403);
    }
  }

  const tenant = await tenantRepo.findTenantById(input.tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  if (input.permissionIds.length > 0) {
    const perms = await permissionRepo.findPermissionsByIds(input.permissionIds);
    if (perms.length !== input.permissionIds.length) {
      throw new AppError("One or more permissions not found", 404);
    }
    if (ctx.scope === "TENANT") {
      const forbidden = perms.find((p) => GLOBAL_ONLY_PERMISSIONS.has(p.name));
      if (forbidden) {
        throw new AppError(
          `Permission "${forbidden.name}" cannot be assigned to TENANT-scoped roles`,
          403,
        );
      }
    }
  }

  return await db.transaction(async (tx) => {
    const role = await roleRepo.createRole({
      tenantId: input.tenantId,
      name: input.name,
      scope: input.scope,
    });

    if (input.permissionIds.length > 0) {
      await roleRepo.syncRolePermissions(role!.id, input.permissionIds, tx);
    }

    return role!;
  });
};

export const updateRole = async (
  ctx: UserContext,
  id: string,
  input: UpdateRoleInput,
) => {
  const permission = ctx.scope === "GLOBAL" ? "role:update" : "role:manage";
  assertPermission(ctx, permission);

  const role = await roleRepo.findRoleById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, role.tenantId);
    if (input.scope === "GLOBAL") {
      throw new AppError(
        "TENANT users cannot change role scope to GLOBAL",
        403,
      );
    }
  }

  if (input.permissionIds) {
    const perms = await permissionRepo.findPermissionsByIds(input.permissionIds);
    if (perms.length !== input.permissionIds.length) {
      throw new AppError("One or more permissions not found", 404);
    }
    if (ctx.scope === "TENANT") {
      const forbidden = perms.find((p) => GLOBAL_ONLY_PERMISSIONS.has(p.name));
      if (forbidden) {
        throw new AppError(
          `Permission "${forbidden.name}" cannot be assigned to TENANT-scoped roles`,
          403,
        );
      }
    }
  }

  return await db.transaction(async (tx) => {
    const updated = await roleRepo.updateRole(id, {
      name: input.name,
      scope: input.scope,
    });

    if (input.permissionIds) {
      await roleRepo.syncRolePermissions(id, input.permissionIds, tx);
    }

    return updated!;
  });
};

export const deleteRole = async (ctx: UserContext, id: string) => {
  const permission = ctx.scope === "GLOBAL" ? "role:delete" : "role:manage";
  assertPermission(ctx, permission);

  const role = await roleRepo.findRoleById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, role.tenantId);
  }

  return await roleRepo.deleteRole(id);
};
