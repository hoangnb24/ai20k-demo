---
name: vercel-react-best-practices
description: Repo-local bridge skill for React TSX reviews. Use when a dedicated agent is checking component quality, hooks usage, accessibility, and performance risks after frontend changes.
---

# Vercel React Best Practices

Use this skill as the repo-local bridge for the session's `vercel:react-best-practices` guidance.

## Default stance

- Stay in review mode unless the parent agent explicitly asks for code edits.
- Prioritize correctness, accessibility, hook safety, and behavior regressions ahead of style opinions.
- Keep recommendations small and actionable.
- Prefer evidence from the touched TSX files over generic React advice.

## Workflow

1. Inspect the changed TSX files and nearby shared components.
2. Check component boundaries, prop shape, hook usage, rendering behavior, and semantic HTML.
3. Flag issues with concrete file references and explain the user-visible or maintenance impact.
4. Batch related comments per file instead of scattering minor notes.
5. Call out missing verification when UI behavior, async state, or accessibility is at risk.

## Focus areas

- hook correctness and dependency issues
- accessibility and semantic HTML
- render churn and avoidable client complexity
- TypeScript prop and event typing
- consistency with shared component patterns

## Avoid

- Style-only comments unless they hide a bug or maintenance risk
- Large refactor suggestions when a targeted fix would solve the issue
- Recommending memoization by default without a clear rerender problem
