---
name: vercel-shadcn-ui
description: Repo-local bridge skill for shadcn/ui work. Use when a dedicated agent is composing UI, extending the design system, or adding shadcn components in a Next.js frontend.
---

# Vercel shadcn/ui

Use this skill as the repo-local bridge for the session's `vercel:shadcn` guidance.

## Default stance

- Reuse existing primitives before inventing new wrappers.
- Keep component APIs simple, composable, and easy to restyle.
- Match the established visual language of the product rather than dropping in generic demo UI.
- If new shadcn pieces are needed, prefer the CLI with non-interactive flags.

## Workflow

1. Inspect `components.json`, shared UI primitives, and the nearest matching screens before editing.
2. Compose with existing `components/ui/*` building blocks whenever possible.
3. Add or extend primitives only when the existing set cannot express the needed interaction cleanly.
4. Keep spacing, typography, states, and theming tokens aligned with the surrounding interface.
5. Verify the result visually on desktop and mobile when the change is user-facing.

## Focus areas

- shadcn/ui composition and extension
- Tailwind utility hygiene
- theme tokens, variants, and interaction states
- accessible dialogs, sheets, menus, tabs, and forms
- polished UI without unnecessary wrapper churn

## Avoid

- Treating shadcn/ui like an opaque dependency instead of owned source
- Building one-off containers when a stronger primitive or variant is the right fix
- Using interactive CLI commands when a non-interactive flag exists
