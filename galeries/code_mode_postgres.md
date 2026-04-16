## Code-Mode Postgres Example

This repo includes a small `demo_orders` table specifically for local experimentation against the Dockerized PostgreSQL container.

### Prepare the data

From the repo root:

```bash
bun run db:start
bun run db:push
bun run db:seed:demo
```

That seeds `10,000` demo orders by default. If you want a larger dataset, run the script from `packages/db` and pass a custom count:

```bash
cd packages/db
bun run db:seed:demo --count=50000
```

You can also run the bundled transformation script:

```bash
bun run db:manipulate:demo
```

It promotes high-value pending orders into review, reroutes expensive self-serve orders to sales, and archives stale shipped orders.

### Why this is a good code-mode example

Once the table is seeded, code-mode becomes useful for one-off data work that is too custom for a permanent product feature:

- Inspecting distribution problems in local data
- Performing bulk updates against a realistic dataset
- Prototyping cleanup logic before turning it into a migration or admin tool

### Example code-mode workflow

Point `database-server` at the same local connection string used by the app:

```text
postgresql://postgres:password@localhost:5432/ai20k-demo
```

Then create a code-mode helper around that MCP server and ask it to do work like:

```text
Show me the status breakdown for demo_orders, then move all pending orders older than 30 days in europe to review, increase priority by 1, and summarize the before/after counts.
```

Other good prompts:

- `Find the 20 largest self-serve orders in north-america and convert them to sales-owned deals.`
- `Archive cancelled orders older than 60 days and tell me how many rows changed.`
- `Compare channel mix before and after rerouting orders above $2,500 to sales.`

This keeps the example grounded in a real containerized Postgres database while showing why code-mode is helpful for ad hoc data manipulation.
