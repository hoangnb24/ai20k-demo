---
name: vercel-nextjs-frontend
description: Repo-local bridge skill for Next.js frontend work. Use when a dedicated agent is handling App Router UI changes, layouts, metadata, route-aware rendering, or Server/Client Component boundaries.
---

# Vercel Next.js Frontend

Use this skill as the repo-local bridge for the session's `vercel:nextjs` guidance.

## Default stance

- Treat App Router patterns as the default unless the codebase clearly uses Pages Router in the touched area.
- Preserve Server Component and Client Component boundaries intentionally.
- Prefer route-aware fixes over local hacks inside leaf components.
- Reach for official Next.js guidance or the session's `vercel:nextjs` skill when framework behavior might be version-sensitive.

## Workflow

1. Inspect the target route, layout, and nearby shared components before editing.
2. Decide whether the work belongs in a Server Component, Client Component, Server Action, or route handler.
3. Make the smallest change that fits the repo's routing and rendering patterns.
4. Keep metadata, loading, error, and empty states consistent with the surrounding app structure.
5. Verify with the smallest relevant local command and a browser check when UI behavior changes.

## Focus areas

- App Router routing and nested layouts
- loading, error, and not-found states
- metadata and route-level configuration
- data fetching and cache-aware UI rendering
- Server Action and route handler boundaries

## Avoid

- Mixing Pages Router and App Router patterns in the same change without a clear reason
- Adding `use client` broadly when a narrower client boundary is enough
- Hiding routing or data-flow issues inside presentational components
