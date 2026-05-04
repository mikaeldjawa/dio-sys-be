import type { UserContext } from "@/types/user-context";
import { AppError } from "@/utils/app-error";
import { assertGlobalScope, assertPermission } from "@/utils/assert-permission";
import * as permissionRepo from "./permission.repository";
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission.schema";

export const listPermissions = async (ctx: UserContext) => {
  const permission =
    ctx.scope === "GLOBAL" ? "permission:list" : "permission:view";
  assertPermission(ctx, permission);
  return await permissionRepo.findAllPermissions();
};

export const getPermission = async (ctx: UserContext, id: string) => {
  const perm = ctx.scope === "GLOBAL" ? "permission:list" : "permission:view";
  assertPermission(ctx, perm);

  const permission = await permissionRepo.findPermissionById(id);
  if (!permission) {
    throw new AppError("Permission not found", 404);
  }
  return permission;
};

export const createPermission = async (
  ctx: UserContext,
  input: CreatePermissionInput,
) => {
  assertGlobalScope(ctx);
  assertPermission(ctx, "permission:create");

  const existing = await permissionRepo.findPermissionByName(input.name);
  if (existing) {
    throw new AppError("Permission with this name already exists", 409);
  }

  return await permissionRepo.createPermission(input);
};

export const updatePermission = async (
  ctx: UserContext,
  id: string,
  input: UpdatePermissionInput,
) => {
  assertGlobalScope(ctx);
  assertPermission(ctx, "permission:update");

  const permission = await permissionRepo.findPermissionById(id);
  if (!permission) {
    throw new AppError("Permission not found", 404);
  }

  if (input.name) {
    const existing = await permissionRepo.findPermissionByName(input.name);
    if (existing && existing.id !== id) {
      throw new AppError("Permission with this name already exists", 409);
    }
  }

  return await permissionRepo.updatePermission(id, input);
};

export const deletePermission = async (ctx: UserContext, id: string) => {
  assertGlobalScope(ctx);
  assertPermission(ctx, "permission:delete");

  const permission = await permissionRepo.findPermissionById(id);
  if (!permission) {
    throw new AppError("Permission not found", 404);
  }

  return await permissionRepo.deletePermission(id);
};
