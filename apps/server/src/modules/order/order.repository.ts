import { db } from "@dio-sys-be/db";
import { menus, orderItems, orders } from "@dio-sys-be/db/schema";
import { and, eq } from "drizzle-orm";
import type { OrderItemInput, OrderStatus } from "./order.schema";

export const findAllOrders = async () => {
  return await db.select().from(orders);
};

export const findOrdersByTenantId = async (
  tenantId: string,
  filters?: { status?: OrderStatus; tableId?: string },
) => {
  const conditions = [eq(orders.tenantId, tenantId)];

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }
  if (filters?.tableId) {
    conditions.push(eq(orders.tableId, filters.tableId));
  }

  return await db
    .select()
    .from(orders)
    .where(and(...conditions));
};

export const findOrderById = async (id: string) => {
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order[0]) return null;

  const items = await db
    .select({
      id: orderItems.id,
      menuId: orderItems.menuId,
      menuName: menus.name,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .innerJoin(menus, eq(orderItems.menuId, menus.id))
    .where(eq(orderItems.orderId, id));

  return { ...order[0], items };
};

export const findOrdersByTableId = async (tableId: string) => {
  return await db
    .select()
    .from(orders)
    .where(eq(orders.tableId, tableId));
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export const createOrderWithItems = async (
  orderData: {
    tenantId: string;
    tableId: string;
    customerId?: string | null;
    totalPrice: number;
  },
  items: (OrderItemInput & { price: number })[],
  tx: Transaction,
) => {
  const [order] = await tx
    .insert(orders)
    .values({
      tenantId: orderData.tenantId,
      tableId: orderData.tableId,
      customerId: orderData.customerId ?? null,
      totalPrice: orderData.totalPrice,
      status: "NEW",
    })
    .returning();

  if (!order) throw new Error("Failed to create order");

  if (items.length > 0) {
    const itemRows = items.map((item) => ({
      orderId: order.id,
      menuId: item.menuId,
      quantity: item.quantity,
      price: item.price,
    }));
    await tx.insert(orderItems).values(itemRows);
  }

  return order;
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const result = await db
    .update(orders)
    .set({ status })
    .where(eq(orders.id, id))
    .returning();
  return result[0] || null;
};

export const deleteOrder = async (id: string) => {
  const result = await db
    .delete(orders)
    .where(eq(orders.id, id))
    .returning();
  return result[0] || null;
};
