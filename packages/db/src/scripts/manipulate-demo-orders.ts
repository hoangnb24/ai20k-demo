import { and, count, eq, gt, lt, sql } from "drizzle-orm";

import { db } from "../index";
import { demoOrders } from "../schema";

async function fetchStatusBreakdown() {
  return db
    .select({
      status: demoOrders.status,
      total: count(),
    })
    .from(demoOrders)
    .groupBy(demoOrders.status)
    .orderBy(demoOrders.status);
}

function printBreakdown(label: string, rows: Awaited<ReturnType<typeof fetchStatusBreakdown>>) {
  console.log(label);

  for (const row of rows) {
    console.log(`  ${row.status}: ${row.total.toLocaleString()}`);
  }
}

async function main() {
  const before = await fetchStatusBreakdown();

  if (before.length === 0) {
    console.log("No demo orders found. Run `bun run db:seed:demo` first.");
    return;
  }

  const staleCutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

  const summary = await db.transaction(async (tx) => {
    const promoted = await tx
      .update(demoOrders)
      .set({
        status: "review",
        priority: sql`${demoOrders.priority} + 1`,
        updatedAt: sql`now()`,
      })
      .where(and(eq(demoOrders.status, "pending"), gt(demoOrders.totalCents, 150_000)))
      .returning({ id: demoOrders.id });

    const routedToSales = await tx
      .update(demoOrders)
      .set({
        channel: "sales",
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(demoOrders.region, "north-america"),
          eq(demoOrders.channel, "self-serve"),
          gt(demoOrders.totalCents, 250_000),
        ),
      )
      .returning({ id: demoOrders.id });

    const archived = await tx
      .update(demoOrders)
      .set({
        status: "archived",
        updatedAt: sql`now()`,
      })
      .where(and(eq(demoOrders.status, "shipped"), lt(demoOrders.createdAt, staleCutoff)))
      .returning({ id: demoOrders.id });

    return {
      promoted: promoted.length,
      routedToSales: routedToSales.length,
      archived: archived.length,
    };
  });

  const after = await fetchStatusBreakdown();

  printBreakdown("Before manipulation:", before);
  console.log("");
  console.log("Applied changes:");
  console.log(`  promoted pending -> review: ${summary.promoted.toLocaleString()}`);
  console.log(`  routed high-value self-serve -> sales: ${summary.routedToSales.toLocaleString()}`);
  console.log(`  archived stale shipped orders: ${summary.archived.toLocaleString()}`);
  console.log("");
  printBreakdown("After manipulation:", after);
}

main().catch((error) => {
  console.error("Failed to manipulate demo orders.");
  console.error(error);
  process.exit(1);
});
