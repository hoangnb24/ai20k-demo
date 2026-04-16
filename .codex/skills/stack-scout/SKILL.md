---
name: stack-scout
description: Research the current best implementation pattern before making code changes. Use when Codex needs up-to-date guidance for a feature, integration, bugfix, or upgrade, especially around Next.js, AI SDK, Gemini, Drizzle, Bun, Docker, or other stack pieces that may have changed recently.
---

# Stack Scout

Run a short research pass only for the stack areas that matter.

Keep the output practical. The goal is not to produce a literature review. The goal is to reduce implementation risk and hand back a brief that another Codex instance can apply immediately in the repo.

## Workflow

1. Identify which stack pieces are involved.
2. Research only the pieces that are likely to be time-sensitive or easy to remember incorrectly.
3. Inspect only the minimum relevant local files needed to map the recommendation into this repo.
4. Return a short implementation brief.
5. If the user asked for implementation, switch from research to local coding work and verify the change.

## Research Pass

Prefer a small number of focused questions over broad searching.

Research only what is relevant to the current task, for example:

- current best pattern for AI SDK streaming in the exact framework version
- current Gemini tool-calling or structured-output patterns
- Next.js App Router caveats for the feature being touched
- Drizzle migration or Bun workspace guidance when schema or tooling work is involved
- Docker or local Postgres setup caveats when the change touches local infra

If DOCKER MCP is available, use it as the default research sidecar instead of making the user re-explain the setup each session.

## DOCKER MCP Bootstrap

When this skill runs in a fresh session:

1. Add `exa` and `context7` through the DOCKER MCP gateway.
2. Create a code-mode helper named `code-mode-stack-research` if it does not already exist.
3. Use that helper for the external research pass.

Treat `code-mode-stack-research` as the default reusable research tool for this repo. The user should not need to ask for MCP setup again.

Recommended shape:

- servers: `exa`, `context7`
- purpose: combine current web results with official library docs into one short research packet
- output: one string with practical sections, not raw dump unless debugging the helper

Important details:

- `code-mode` tools are session-scoped, so recreate `code-mode-stack-research` when needed.
- For hyphenated tool names inside code mode, use `globalThis['resolve-library-id']` and `globalThis['get-library-docs']`.
- Prefer exact official library IDs when known:
  - Next.js: `/vercel/next.js`
  - AI SDK: `/vercel/ai`

Fallback rules:

- If DOCKER MCP is unavailable, or `code-mode-stack-research` cannot be created, use the best available primary-source documentation tools and web search directly.
- Keep the same output contract even when the code-mode helper is unavailable.
- Do not block the task on recreating the helper if equivalent research can proceed without it.

Starter script pattern:

```js
const getLibraryDocs = globalThis['get-library-docs'];

const nextDocs = getLibraryDocs({
  context7CompatibleLibraryID: '/vercel/next.js',
  topic: 'the exact Next.js feature involved in this task',
  tokens: 1800,
});

const aiDocs = getLibraryDocs({
  context7CompatibleLibraryID: '/vercel/ai',
  topic: 'the exact AI SDK feature involved in this task',
  tokens: 1800,
});

const web = web_search_exa({
  query: 'official docs, release notes, or migration guidance for the exact feature and version involved',
  numResults: 3,
});

return ['DOCS', nextDocs, aiDocs, 'WEB', web].join('\n\n');
```

Avoid:

- generic tutorials
- unrelated libraries
- long summaries with no implementation consequence
- researching the whole stack when only one layer is changing

## Output Contract

Return a concise implementation brief with these sections:

1. `Recommended pattern`
   State the best fit for this repo and feature.

2. `Caveats`
   Call out version-specific or provider-specific constraints.

3. `Avoid`
   Name the patterns likely to cause churn, incompatibility, or unnecessary complexity.

4. `Apply here`
   After the research pass, point to the local files or modules where the pattern should be implemented.

5. `Verify`
   Suggest the local commands or checks that should confirm the change.

Keep the brief short enough that it can be read once and acted on immediately.

## Implementation Hand-off

When the user asks to implement after the research pass:

- follow the recommended pattern unless the local codebase strongly suggests a better fit
- preserve existing repo conventions
- make the code changes locally rather than trying to do implementation through research tools
- verify with the smallest relevant set of local commands

## Example Requests

The following user requests should trigger this skill:

- `Use stack-scout before adding tool calling to our chat route`
- `Research the best current AI SDK pattern for this feature, then implement it`
- `Check the latest Drizzle migration approach before we touch the schema`
- `Scout Next.js 16 caveats for this UI change before coding`
