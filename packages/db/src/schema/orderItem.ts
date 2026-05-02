import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { orders } from "./order";

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  menu_id: uuid("menu_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});
