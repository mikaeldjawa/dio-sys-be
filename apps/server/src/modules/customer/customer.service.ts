import type { UserContext } from "@/types/user-context";
import { AppError } from "@/utils/app-error";
import {
  assertPermission,
  assertTenantMatch,
} from "@/utils/assert-permission";
import * as tenantRepo from "../tenant/tenant.repository";
import * as customerRepo from "./customer.repository";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "./customer.schema";

export const listCustomers = async (ctx: UserContext) => {
  assertPermission(ctx, "customer:read");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) throw new AppError("Tenant context required", 400);
    return await customerRepo.findCustomersByTenantId(ctx.tenantId);
  }

  return await customerRepo.findAllCustomers();
};

export const getCustomersByTenant = async (
  ctx: UserContext,
  tenantId: string,
) => {
  assertPermission(ctx, "customer:read");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) throw new AppError("Tenant context required", 400);
    if (ctx.tenantId !== tenantId)
      throw new AppError("You do not have access to this tenant", 403);
  }

  const tenant = await tenantRepo.findTenantById(tenantId);
  if (!tenant) throw new AppError("Tenant not found", 404);

  return await customerRepo.findCustomersByTenantId(tenantId);
};

export const getCustomer = async (ctx: UserContext, id: string) => {
  assertPermission(ctx, "customer:read");

  const customer = await customerRepo.findCustomerById(id);
  if (!customer) throw new AppError("Customer not found", 404);

  if (ctx.scope === "TENANT") assertTenantMatch(ctx, customer.tenantId);

  return customer;
};

export const createCustomer = async (
  ctx: UserContext,
  input: CreateCustomerInput,
) => {
  assertPermission(ctx, "customer:create");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) throw new AppError("Tenant context required", 400);
    if (input.tenantId !== ctx.tenantId)
      throw new AppError("You can only create customers in your own tenant", 403);
  }

  const tenant = await tenantRepo.findTenantById(input.tenantId);
  if (!tenant) throw new AppError("Tenant not found", 404);

  return await customerRepo.createCustomer({
    tenantId: input.tenantId,
    name: input.name,
    phone: input.phone ?? null,
    email: input.email ?? null,
  });
};

export const updateCustomer = async (
  ctx: UserContext,
  id: string,
  input: UpdateCustomerInput,
) => {
  assertPermission(ctx, "customer:update");

  const customer = await customerRepo.findCustomerById(id);
  if (!customer) throw new AppError("Customer not found", 404);

  if (ctx.scope === "TENANT") assertTenantMatch(ctx, customer.tenantId);

  return await customerRepo.updateCustomer(id, {
    name: input.name,
    phone: input.phone ?? undefined,
    email: input.email ?? undefined,
  });
};

export const deleteCustomer = async (ctx: UserContext, id: string) => {
  assertPermission(ctx, "customer:delete");

  const customer = await customerRepo.findCustomerById(id);
  if (!customer) throw new AppError("Customer not found", 404);

  if (ctx.scope === "TENANT") assertTenantMatch(ctx, customer.tenantId);

  return await customerRepo.deleteCustomer(id);
};
