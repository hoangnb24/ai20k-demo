# Clerk Billing Implementation Prompt

Use this prompt at the start of the next session when we are ready to implement the billing feature in this repo.

## Prompt

Objective

Implement a new Billing feature for this repo using the Clerk Billing approach. Build a public `/billing` page that showcases our product plans, lets signed-in users upgrade through Clerk Billing, and prepares the app for plan or feature gating on premium surfaces. Do the actual code changes in this repo, verify them locally, and leave the codebase in a clean implementation-ready state.

Context

- Repo root: `/Users/themrb/Documents/personal/ai20k/ai20k-demo-clerk-auth`
- This is a Bun monorepo with:
  - Next.js 16 App Router app in `apps/web`
  - Clerk auth already present
  - shared UI primitives in `packages/ui`
  - Drizzle/Postgres package in `packages/db`
- Current local file anchors:
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/components/header.tsx`
  - `apps/web/src/proxy.ts`
  - `apps/web/src/app/page.tsx`
  - `apps/web/src/app/ai/page.tsx`
  - `apps/web/src/app/api/ai/route.ts`
  - `apps/web/package.json`
  - `packages/env/src/server.ts`
  - `packages/env/src/web.ts`
- Current validated stack snapshot from the previous research session:
  - `next@^16.2.0`
  - `react` / `react-dom` catalog versions aligned to React 19
  - `@clerk/nextjs@^7.2.1`
  - shared shadcn-style UI through `@ai20k-demo/ui`
- Current auth posture already in repo:
  - `ClerkProvider` is already in the root layout
  - `proxy.ts` already protects `/ai(.*)` and `/api/ai(.*)`
  - `/api/ai` already checks `auth()` and returns `401` when unsigned
- Product decision already made:
  - Use the Clerk Billing approach for v1, not a direct Stripe Billing integration
  - The billing page should be public and should act as a pricing / upgrade page
  - We want to be ready for implementation in this session, not just more research

Canonical Sources

Use sources in this order:

1. Real repo files in this checkout
2. Current official Clerk docs for Billing, PricingTable, CheckoutButton, and plan / feature checks
3. Current official Next.js docs for App Router Route Handlers, redirects, and client navigation

Useful official docs from the prior research pass:

- `https://clerk.com/docs/nextjs/guides/billing/for-b2c`
- `https://clerk.com/docs/nextjs/reference/components/billing/pricing-table`
- `https://clerk.com/docs/nextjs/reference/components/billing/checkout-button`
- `https://nextjs.org/docs/app/getting-started/route-handlers`
- `https://nextjs.org/docs/app/guides/redirecting`

Important implementation caveats

- Clerk Billing is currently Beta and Clerk recommends pinning SDK versions because APIs may change.
- Do not assume all Billing exports are available exactly as remembered. Verify against the current official docs and the repo's declared Clerk version before coding.
- If the exact Billing components or experimental exports needed for the chosen implementation are incompatible with the repo's current Clerk version, do not fake it. Make the smallest safe repo change needed and explain it.
- Do not switch the feature to direct Stripe unless there is a hard blocker. If there is a blocker, explain it clearly and stop before doing a broader billing redesign.
- Keep `/billing` public.
- Keep premium authorization checks server-side when access control matters. Do not rely only on client rendering.
- Preserve existing repo patterns and avoid unnecessary redesign outside the billing feature.

Work Style

- Start by inspecting the repo files listed above before editing.
- Verify the current best Clerk Billing pattern before implementation. Keep research focused and practical.
- Prefer the smallest working implementation that still feels polished and product-ready.
- Keep the visual design intentional. This billing page is also a showcase page, not just a raw integration screen.
- Reuse the shared UI package where appropriate instead of introducing ad hoc UI primitives.
- Be careful with auth boundaries, navigation, and any env changes.
- Make reasonable assumptions when needed, but state them at the end.

Implementation Goals

Implement the best v1 Clerk Billing flow for this repo, including as much of the following as is safely supported by the repo's current Clerk setup:

1. Add a public billing route at `apps/web/src/app/billing/page.tsx`.
2. Add a navigation entry for Billing in the app header.
3. Make the billing page useful as a product showcase:
   - clear headline
   - short product framing
   - plan comparison or pricing presentation
   - upgrade CTA
4. Use Clerk Billing UI where it is the best fit, likely `PricingTable` and related Billing components if compatible with the current package version and docs.
5. If a signed-in-aware CTA is needed, use the correct Clerk pattern for upgrade / checkout initiation.
6. Prepare at least one premium access example in the app using `auth().has()` or `Show` with plan or feature checks, but keep the change proportional.
7. Keep the AI chat route protections intact.
8. If env or package changes are necessary for the Clerk Billing implementation, make only the minimal safe set.

Suggested apply-here map

- `apps/web/src/app/billing/page.tsx`
  - new public billing / pricing page
- `apps/web/src/components/header.tsx`
  - add Billing nav item
- `apps/web/src/app/page.tsx`
  - optionally add a stronger entry point or CTA linking to `/billing` if it improves the flow
- `apps/web/package.json`
  - only if Clerk package pinning or package additions are required
- `packages/env/src/server.ts` and `packages/env/src/web.ts`
  - only if explicit Clerk Billing env handling is truly required by the chosen implementation

Tool Rules

- Build context from repo files first.
- Use current official docs for Clerk and Next.js before relying on memory.
- If something is version-sensitive, verify it.
- Use browser verification if a dev server is running and the page needs a visual or runtime check.
- Do not create permanent throwaway scripts for this task.
- Do not introduce a direct Stripe backend flow unless Clerk Billing is proven blocked for this repo.

Output Contract

While working:

- Give short progress updates.
- Explain any version or export mismatch clearly.

At the end:

- Summarize what was implemented.
- List any important caveats or follow-up work.
- Include the key files changed.
- Report what you verified locally and what you could not verify.

Verification

At minimum, verify the implementation with the smallest relevant set of checks:

1. Type or build-oriented checks for touched code
2. Local route verification for `/billing`
3. Navigation verification from the header
4. Signed-out behavior on the public billing page
5. Signed-in behavior for billing CTA or Clerk Billing UI, if locally testable

If the repo dependencies are not installed locally, say so clearly and still leave the code in a reviewable state.

Done Criteria

Stop only when all of the following are true:

- `/billing` exists and is wired into the app
- the page presents the product and pricing in a polished way
- Clerk Billing is used in the best safe way supported by the repo's current setup
- any entitlement or premium-gating example added is server-safe
- the implementation has been verified as far as the local environment allows
- the final report clearly states assumptions, verification results, and any follow-up risk

## Notes For The Next Session

- This repo currently does not have `.khuym/onboarding.json`, so if the next session wants to use the full Khuym workflow strictly, handle onboarding first.
- For this specific feature, keep the mindset in implementation mode, not research mode.
- If Clerk Billing components are available and compatible, prefer that over inventing custom pricing UI from scratch. If the built-in component needs surrounding product-marketing content, compose around it rather than replacing it.
