import type { UserContext } from "@/types/user-context";
import { AppError } from "@/utils/app-error";
import { assertPermission, assertTenantMatch } from "@/utils/assert-permission";
import { db } from "@dio-sys-be/db";
import { tables } from "@dio-sys-be/db/schema";
import { eq } from "drizzle-orm";
import * as categoryRepo from "../category/category.repository";
import * as customerRepo from "../customer/customer.repository";
import * as menuRepo from "../menu/menu.repository";
import * as tableRepo from "../table/table.repository";
import * as orderRepo from "./order.repository";
import type {
  CreateOrderInput,
  OrderStatus,
  PublicCreateOrderInput,
  UpdateOrderStatusInput,
} from "./order.schema";

const TERMINAL_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELED"];

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["PROCESSING", "CANCELED"],
  PROCESSING: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

export const listOrders = async (
  ctx: UserContext,
  filters?: { status?: OrderStatus; tableId?: string },
) => {
  assertPermission(ctx, "order:read");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) throw new AppError("Tenant context required", 400);
    return await orderRepo.findOrdersByTenantId(ctx.tenantId, filters);
  }

  return await orderRepo.findAllOrders();
};

export const getOrder = async (ctx: UserContext, id: string) => {
  assertPermission(ctx, "order:read");

  const order = await orderRepo.findOrderById(id);
  if (!order) throw new AppError("Order not found", 404);

  if (ctx.scope === "TENANT") assertTenantMatch(ctx, order.tenantId);

  return order;
};

export const createOrder = async (
  ctx: UserContext,
  input: CreateOrderInput,
) => {
  assertPermission(ctx, "order:create");

  if (ctx.scope === "TENANT") {
    if (!ctx.tenantId) throw new AppError("Tenant context required", 400);
    if (input.tenantId !== ctx.tenantId)
      throw new AppError("You can only create orders in your own tenant", 403);
  }

  const table = await tableRepo.findTableById(input.tableId);
  if (!table) throw new AppError("Table not found", 404);
  if (table.tenantId !== input.tenantId)
    throw new AppError("Table does not belong to this tenant", 400);

  if (input.customerId) {
    const customer = await customerRepo.findCustomerById(input.customerId);
    if (!customer) throw new AppError("Customer not found", 404);
    if (customer.tenantId !== input.tenantId)
      throw new AppError("Customer does not belong to this tenant", 400);
  }

  const resolvedItems = await Promise.all(
    input.items.map(async (item) => {
      const menu = await menuRepo.findMenuById(item.menuId);
      if (!menu) throw new AppError(`Menu item ${item.menuId} not found`, 404);
      if (menu.tenantId !== input.tenantId)
        throw new AppError(
          `Menu item ${item.menuId} does not belong to this tenant`,
          400,
        );
      if (!menu.isAvailable)
        throw new AppError(`Menu item "${menu.name}" is not available`, 400);
      return { ...item, price: menu.price };
    }),
  );

  const totalPrice = resolvedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return await db.transaction(async (tx) => {
    const order = await orderRepo.createOrderWithItems(
      {
        tenantId: input.tenantId,
        tableId: input.tableId,
        customerId: input.customerId ?? null,
        totalPrice,
      },
      resolvedItems,
      tx,
    );

    await tx
      .update(tables)
      .set({ status: "OCCUPIED" })
      .where(eq(tables.id, input.tableId));

    return order;
  });
};

export const updateOrderStatus = async (
  ctx: UserContext,
  id: string,
  input: UpdateOrderStatusInput,
) => {
  assertPermission(ctx, "order:update");

  const order = await orderRepo.findOrderById(id);
  if (!order) throw new AppError("Order not found", 404);

  if (ctx.scope === "TENANT") assertTenantMatch(ctx, order.tenantId);

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(input.status)) {
    throw new AppError(
      `Cannot transition order from ${order.status} to ${input.status}`,
      400,
    );
  }

  const updated = await orderRepo.updateOrderStatus(id, input.status);

  if (TERMINAL_STATUSES.includes(input.status)) {
    await tableRepo.updateTable(order.tableId, { status: "AVAILABLE" });
  }

  return updated;
};

export const deleteOrder = async (ctx: UserContext, id: string) => {
  assertPermission(ctx, "order:cancel");

  const order = await orderRepo.findOrderById(id);
  if (!order) throw new AppError("Order not found", 404);

  if (ctx.scope === "TENANT") assertTenantMatch(ctx, order.tenantId);

  if (order.status !== "NEW") {
    throw new AppError("Only NEW orders can be deleted", 400);
  }

  return await orderRepo.deleteOrder(id);
};

export const getPublicMenu = async (tableId: string) => {
  const table = await tableRepo.findTableById(tableId);
  if (!table) throw new AppError("Table not found", 404);

  const categories = await categoryRepo.findCategoriesByTenantId(
    table.tenantId,
  );
  const menus = await menuRepo.findMenusByFilters({
    tenantId: table.tenantId,
    isAvailable: true,
  });

  return {
    table: { id: table.id, name: table.name, capacity: table.capacity },
    categories,
    menus,
  };
};

export const createPublicOrder = async (input: PublicCreateOrderInput) => {
  const table = await tableRepo.findTableById(input.tableId);
  if (!table) throw new AppError("Table not found", 404);

  const tenantId = table.tenantId;

  const resolvedItems = await Promise.all(
    input.items.map(async (item) => {
      const menu = await menuRepo.findMenuById(item.menuId);
      if (!menu) throw new AppError(`Menu item ${item.menuId} not found`, 404);
      if (menu.tenantId !== tenantId)
        throw new AppError(
          `Menu item ${item.menuId} does not belong to this tenant`,
          400,
        );
      if (!menu.isAvailable)
        throw new AppError(`Menu item "${menu.name}" is not available`, 400);
      return { ...item, price: menu.price };
    }),
  );

  const totalPrice = resolvedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  let customerId: string | null = null;

  if (input.customerName) {
    let customer = null;

    if (input.customerPhone) {
      customer = await customerRepo.findCustomerByPhoneAndTenant(
        input.customerPhone,
        tenantId,
      );
    }

    if (!customer) {
      customer = await customerRepo.createCustomer({
        tenantId,
        name: input.customerName,
        phone: input.customerPhone ?? null,
        email: input.customerEmail ?? null,
      });
    }

    customerId = customer?.id ?? null;
  }

  return await db.transaction(async (tx) => {
    const order = await orderRepo.createOrderWithItems(
      { tenantId, tableId: input.tableId, customerId, totalPrice },
      resolvedItems,
      tx,
    );

    await tx
      .update(tables)
      .set({ status: "OCCUPIED" })
      .where(eq(tables.id, input.tableId));

    return order;
  });
};
