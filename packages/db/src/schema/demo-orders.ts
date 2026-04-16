import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const demoOrders = pgTable(
  "demo_orders",
  {
    id: serial("id").primaryKey(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    region: text("region").notNull(),
    channel: text("channel").notNull(),
    status: text("status").notNull(),
    priority: integer("priority").notNull().default(0),
    itemCount: integer("item_count").notNull(),
    totalCents: integer("total_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("demo_orders_status_idx").on(table.status),
    index("demo_orders_region_idx").on(table.region),
    index("demo_orders_created_at_idx").on(table.createdAt),
  ],
);
