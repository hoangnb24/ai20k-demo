# Transient Script Templates

Use this file only when you need a concrete execution shape for `postgres-seed-lab`.

## Code-Mode Execution Pattern

After creating the helper with `code_mode({ name: "seed-data", servers: ["database-server"] })`, invoke it through `mcp_exec`.

Shape:

```json
{
  "name": "code-mode-seed-data",
  "arguments": {
    "script": "<javascript here>"
  }
}
```

Rules:

- The `script` must return a string.
- The available helper functions are listed in the `code_mode` creation response.
- Use the exact function names and argument shapes shown there for `database-server`.
- Return compact JSON text rather than prose.

Suggested return shape:

```json
{
  "dataset": "demo_orders",
  "plan": "preview then apply",
  "previewCount": 0,
  "changedCount": 0,
  "samples": []
}
```

## js_repl Read-Only Template

```js
const { Client } = await import("pg");

const client = new Client({
  connectionString: "postgresql://postgres:password@localhost:5432/ai20k-demo",
});

await client.connect();

try {
  const result = await client.query(`
    select status, count(*)::int as total
    from demo_orders
    group by 1
    order by 1
  `);

  console.log(
    JSON.stringify(
      {
        dataset: "demo_orders",
        rows: result.rows,
      },
      null,
      2,
    ),
  );
} finally {
  await client.end();
}
```

## js_repl Mutation Template

```js
const { Client } = await import("pg");

const client = new Client({
  connectionString: "postgresql://postgres:password@localhost:5432/ai20k-demo",
});

await client.connect();

try {
  await client.query("begin");

  const preview = await client.query(`
    select id, status, region, priority
    from demo_orders
    where status = 'pending'
      and region = 'europe'
      and created_at < now() - interval '30 days'
    order by total_cents desc
    limit 5
  `);

  const beforeCount = await client.query(`
    select count(*)::int as total
    from demo_orders
    where status = 'pending'
      and region = 'europe'
      and created_at < now() - interval '30 days'
  `);

  const changed = await client.query(`
    update demo_orders
    set status = 'review',
        priority = priority + 1,
        updated_at = now()
    where status = 'pending'
      and region = 'europe'
      and created_at < now() - interval '30 days'
    returning id
  `);

  await client.query("commit");

  console.log(
    JSON.stringify(
      {
        dataset: "demo_orders",
        previewCount: beforeCount.rows[0]?.total ?? 0,
        changedCount: changed.rowCount ?? 0,
        samples: preview.rows,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
```
