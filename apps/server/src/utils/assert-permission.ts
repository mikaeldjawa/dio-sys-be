import type { UserContext } from "@/types/user-context";
import { AppError } from "./app-error";

export const assertGlobalScope = (ctx: UserContext): void => {
  if (ctx.scope !== "GLOBAL") {
    throw new AppError("This operation requires GLOBAL scope", 403);
  }
};

export const assertTenantScope = (ctx: UserContext): void => {
  if (ctx.scope !== "TENANT") {
    throw new AppError("This operation requires TENANT scope", 403);
  }
};

export const assertScopeOneOf = (
  ctx: UserContext,
  scopes: Array<"GLOBAL" | "TENANT">,
): void => {
  if (!scopes.includes(ctx.scope)) {
    throw new AppError(
      `This operation requires one of: ${scopes.join(", ")} scope`,
      403,
    );
  }
};

export const assertTenantMatch = (
  ctx: UserContext,
  resourceTenantId: string,
): void => {
  if (ctx.scope === "TENANT" && ctx.tenantId !== resourceTenantId) {
    throw new AppError("You do not have access to this resource", 403);
  }
};

export const assertPermission = (ctx: UserContext, required: string): void => {
  if (!ctx.permissions.includes(required)) {
    throw new AppError(`Missing required permission: ${required}`, 403);
  }
};
