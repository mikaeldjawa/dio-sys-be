import type { UserContext } from "@/types/user-context";
import { AppError } from "@/utils/app-error";
import {
  assertPermission,
  assertTenantMatch,
} from "@/utils/assert-permission";
import * as tenantRepo from "../tenant/tenant.repository";
import * as tableRepo from "./table.repository";
import type {
  CreateTableInput,
  TableStatus,
  UpdateTableInput,
} from "./table.schema";

export const listTables = async (
  ctx: UserContext,
  filters?: { status?: TableStatus },
) => {
  assertPermission(ctx, "table:read");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    if (filters?.status) {
      return await tableRepo.findTablesByTenantAndStatus(
        ctx.tenantId,
        filters.status,
      );
    }
    return await tableRepo.findTablesByTenantId(ctx.tenantId);
  }

  return await tableRepo.findAllTables();
};

export const getTablesByTenant = async (ctx: UserContext, tenantId: string) => {
  assertPermission(ctx, "table:read");

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

  return await tableRepo.findTablesByTenantId(tenantId);
};

export const getTable = async (ctx: UserContext, id: string) => {
  assertPermission(ctx, "table:read");

  const table = await tableRepo.findTableById(id);
  if (!table) {
    throw new AppError("Table not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, table.tenantId);
  }

  return table;
};

export const createTable = async (
  ctx: UserContext,
  input: CreateTableInput,
) => {
  assertPermission(ctx, "table:create");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) {
      throw new AppError("Tenant context required", 400);
    }
    if (input.tenantId !== ctx.tenantId) {
      throw new AppError("You can only create tables in your own tenant", 403);
    }
  }

  const tenant = await tenantRepo.findTenantById(input.tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  return await tableRepo.createTable({
    tenantId: input.tenantId,
    name: input.name,
    capacity: input.capacity,
    status: input.status,
  });
};

export const updateTable = async (
  ctx: UserContext,
  id: string,
  input: UpdateTableInput,
) => {
  assertPermission(ctx, "table:update");

  const table = await tableRepo.findTableById(id);
  if (!table) {
    throw new AppError("Table not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, table.tenantId);
  }

  return await tableRepo.updateTable(id, input);
};

export const updateTableStatus = async (
  ctx: UserContext,
  id: string,
  status: TableStatus,
) => {
  assertPermission(ctx, "table:update");

  const table = await tableRepo.findTableById(id);
  if (!table) {
    throw new AppError("Table not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, table.tenantId);
  }

  return await tableRepo.updateTable(id, { status });
};

export const deleteTable = async (ctx: UserContext, id: string) => {
  assertPermission(ctx, "table:delete");

  const table = await tableRepo.findTableById(id);
  if (!table) {
    throw new AppError("Table not found", 404);
  }

  if (ctx.scope === "TENANT") {
    assertTenantMatch(ctx, table.tenantId);
  }

  return await tableRepo.deleteTable(id);
};
