---
name: postgres-seed-lab
description: Turn plain-language requests into transient query or mutation scripts for the local seeded Postgres database in this repo. Use when Codex needs to inspect, clean up, backfill, bulk update, or analyze demo_orders or other local seed data, preferably through DOCKER MCP code-mode and otherwise through js_repl without requiring a checked-in script.
---

# Postgres Seed Lab

Use this skill for local data work, not for product feature implementation.

The goal is to let the user say what they want changed in plain language, have Codex generate a small script on the fly, execute it immediately, and return a compact answer. Prefer DOCKER MCP code-mode when it works. If code-mode is unavailable or broken, do the same job through `js_repl` instead of stopping.

## Minimal Anchors

1. Inspect only the minimum local files needed to anchor the task:
   - `apps/web/.env`
   - `packages/db/package.json`
   - `packages/db/src/schema`
   - `packages/db/src/scripts`

## Repo Anchors

Default local connection:

- `postgresql://postgres:password@localhost:5432/ai20k-demo`

Important local files:

- schema: `packages/db/src/schema/demo-orders.ts`
- seed script: `packages/db/src/scripts/seed-demo-orders.ts`
- manipulation example: `packages/db/src/scripts/manipulate-demo-orders.ts`

Default root commands:

- `bun run db:start`
- `bun run db:push`
- `bun run db:seed:demo`
- `bun run db:manipulate:demo`

If the user wants a larger dataset than the default root script provides, run from `packages/db`:

```bash
cd packages/db
bun run db:seed:demo --count=50000
```

## Default Execution Loop

When this skill runs in a fresh session:

1. Make sure the local database is ready.
   - Use `bun run db:start` if the container is not running.
   - Use `bun run db:push` if the schema is not present yet.
   - Use `bun run db:seed:demo` only when the table is empty or the user asks for a reset.
2. Translate the user request into four parts before executing anything:
   - dataset or table
   - preview query
   - mutation or read-only query
   - verification query
3. Prefer DOCKER MCP code-mode.
   - Add and configure `database-server` with the repo `DATABASE_URL`.
   - Create or reuse `code-mode-seed-data` through `code_mode` with `servers: ["database-server"]`.
   - Read the tool-details response and use `mcp_exec` with `name: "code-mode-seed-data"` and a `script` string.
   - Inside that script, use the exact function names exposed by the helper, preview the target set first, then execute if appropriate, and return a compact JSON string.
4. If DOCKER MCP code-mode creation fails, the helper exits during initialize, or the local runtime has `code_mode` disabled, fall back to `js_repl`.
   - Generate the transient script inline in `js_repl`.
   - Use `pg` directly against `postgresql://postgres:password@localhost:5432/ai20k-demo`.
   - Keep the script in memory for one-offs; do not create repo files unless the user wants the logic saved.
5. Only promote the operation into a checked-in script under `packages/db/src/scripts` when the user explicitly wants a repeatable automation path.

The user should not need to restate the connection details each session. Treat `code-mode-seed-data` as the default dynamic helper for this project whenever it is available.

## Code-Mode Contract

When code-mode works, use it as the first-choice executor for ad hoc data work.

- Helper name: `code-mode-seed-data`
- Invoke via `mcp_exec`
- Arguments shape: `{ "script": "<javascript here>" }`
- Script responsibilities:
  - inspect the target set first
  - execute the change only when the request is clearly read-only or explicitly apply-now
  - return one compact string, ideally JSON
  - report counts, a few sample ids or rows, and before/after summaries

Do not guess the available helper function names. Inspect the `code_mode` creation response first and use the exact tool names and argument shapes it exposes for `database-server`.

## js_repl Fallback Contract

When code-mode is unavailable, keep the same user experience through `js_repl`.

- Use `await import("pg")`
- Connect with the repo `DATABASE_URL`
- For writes, wrap the work in `BEGIN` / `COMMIT` / `ROLLBACK`
- Print compact JSON only
- Return counts plus a few sample rows, not a full dump

See `references/transient-script-templates.md` for example `mcp_exec` and `js_repl` shapes.

## Mutation Rules

Treat the local data as resettable, but still be disciplined:

- For read-only requests, return the result and a short summary.
- For mutating requests, first identify the target set or count unless the user explicitly asks to apply immediately.
- After a write, report what changed with before and after counts.
- When useful, include a few example rows or categories affected, not a raw dump of the entire table.
- If the requested change is destructive or ambiguous, prefer a reversible update over a delete, or remind the user that reseeding with `bun run db:seed:demo` is the clean reset path.

## Fallback Rules

- If DOCKER MCP is unavailable or `database-server` cannot be configured, fall back to `js_repl` before reaching for shell pipelines.
- If `js_repl` is also blocked, use local repo commands and scripts.
- Use the checked-in scripts first only when they already fit exactly.
- If no checked-in script fits and the user wants repeatability, add or update a script in `packages/db/src/scripts`.

Do not block the task on helper creation if equivalent local work can proceed safely.

## Output Contract

Return a concise data-work brief with these sections:

1. `Dataset`
   State which table or seed set is being touched.

2. `Plan`
   Say what will be inspected or changed.

3. `Applied change`
   For writes, summarize the exact effect.

4. `Verify`
   Suggest the next local command or query to confirm the result.

Keep the response short enough that another Codex instance could immediately continue the task.

## Example Requests

The following user requests should trigger this skill:

- `Use $postgres-seed-lab to generate and run a transient script that shows the status breakdown for demo_orders.`
- `Use $postgres-seed-lab to preview the pending europe orders older than 30 days, then move them to review and summarize the changes.`
- `Use $postgres-seed-lab to generate a one-off script for rerouting high-value self-serve orders to sales and execute it now.`
- `Use $postgres-seed-lab to inspect whether our seed data distribution looks realistic and return counts only.`
- `Use $postgres-seed-lab to prototype a bulk cleanup as a transient script first, then turn it into a checked-in script.`
