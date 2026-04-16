import { sql } from "drizzle-orm";

import { db } from "../index";
import { demoOrders } from "../schema";

type DemoOrderInsert = typeof demoOrders.$inferInsert;

const regions = ["north-america", "south-america", "europe", "apac"] as const;
const channels = ["self-serve", "sales", "partner"] as const;
const firstNames = ["Avery", "Jordan", "Sam", "Taylor", "Riley", "Morgan", "Cameron", "Parker"];
const lastNames = ["Nguyen", "Tran", "Patel", "Garcia", "Kim", "Singh", "Brown", "Johnson"];
const domains = ["example.com", "acme.test", "local.demo", "seeded.dev"];

function parseNumberArg(flag: string, fallback: number) {
  const entry = process.argv.find((argument) => argument.startsWith(`${flag}=`));
  if (!entry) {
    return fallback;
  }

  const value = Number(entry.slice(flag.length + 1));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function createRng(seed: number) {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(values: readonly T[], random: () => number) {
  return values[Math.floor(random() * values.length)]!;
}

function createOrder(index: number, random: () => number): DemoOrderInsert {
  const firstName = pick(firstNames, random);
  const lastName = pick(lastNames, random);
  const region = pick(regions, random);
  const channel = pick(channels, random);
  const statusRoll = random();
  const status =
    statusRoll < 0.36
      ? "pending"
      : statusRoll < 0.56
        ? "review"
        : statusRoll < 0.78
          ? "packing"
          : statusRoll < 0.94
            ? "shipped"
            : "cancelled";

  const itemCount = 1 + Math.floor(random() * 8);
  const totalCents = 4_500 + Math.floor(random() * 325_000);
  const createdAt = new Date(
    Date.now() - Math.floor(random() * 120) * 24 * 60 * 60 * 1000 - Math.floor(random() * 86_400_000),
  );

  return {
    customerName: `${firstName} ${lastName}`,
    customerEmail: `${firstName}.${lastName}.${index}@${pick(domains, random)}`.toLowerCase(),
    region,
    channel,
    status,
    itemCount,
    totalCents,
    priority: totalCents > 200_000 ? 2 : totalCents > 100_000 ? 1 : 0,
    createdAt,
    updatedAt: createdAt,
  };
}

async function main() {
  const totalRows = parseNumberArg("--count", 10_000);
  const batchSize = parseNumberArg("--batch-size", 500);
  const shouldAppend = hasFlag("--append");
  const random = createRng(parseNumberArg("--seed", 20_000));

  if (!shouldAppend) {
    await db.execute(sql`truncate table ${demoOrders} restart identity`);
  }

  for (let offset = 0; offset < totalRows; offset += batchSize) {
    const currentBatchSize = Math.min(batchSize, totalRows - offset);
    const batch: DemoOrderInsert[] = [];

    for (let index = 0; index < currentBatchSize; index += 1) {
      batch.push(createOrder(offset + index + 1, random));
    }

    await db.insert(demoOrders).values(batch);
    console.log(`Seeded ${offset + currentBatchSize}/${totalRows} demo orders`);
  }

  console.log(
    `Finished seeding ${totalRows.toLocaleString()} demo orders into demo_orders${shouldAppend ? " (append mode)" : ""}.`,
  );
}

main().catch((error) => {
  console.error("Failed to seed demo orders.");
  console.error(error);
  process.exit(1);
});
