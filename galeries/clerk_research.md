As of April 16, 2026, the best fit here is Clerk’s App Router setup with ClerkProvider in the root layout, a proxy.ts file for coarse route protection, and auth() inside server code for the final
  authorization check.

  - Keep @clerk/nextjs as the only auth package here. It is already installed in apps/web/package.json.
  - Add ClerkProvider in apps/web/src/app/layout.tsx, wrapping the existing Providers tree instead of moving Clerk into the client-only provider file.
  - Create apps/web/src/proxy.ts because this app uses src/app, and Next.js 16’s current convention is proxy.ts, not middleware.ts.
  - Use clerkMiddleware() plus createRouteMatcher() to protect only the paid/private surfaces first: /ai(.*) and /api/ai(.*).
  - Use auth() in Server Components and Route Handlers. Use currentUser() only when you need profile fields beyond userId.
  - In apps/web/src/components/header.tsx, use SignInButton, optional SignUpButton, and UserButton behind SignedIn / SignedOut. Clerk’s newer quickstarts also show Show; either works, but SignedIn /
    SignedOut is the cleaner fit for this header.
  - For apps/web/src/app/api/ai/route.ts, do not rely on proxy alone. Check auth() in the handler and return an explicit 401 JSON/response when unsigned.

  Caveats

  - auth() requires Clerk middleware/proxy to be configured first.
  - Because apps/web/src/components/header.tsx links from public / to likely-protected /ai, set prefetch={false} on that link if /ai becomes protected. Clerk documents confusing prefetch errors
    otherwise.
  - currentUser() calls Clerk’s Backend API and counts against that API’s rate limit. Prefer auth() when userId is enough.
  - Keyless mode appears supported in Clerk’s current Next.js guidance, but for this repo I’d treat it as a short-lived local spike only. This is an inference from Clerk’s current docs plus your env
    setup.
  - The repo already validates env through packages/env/src/server.ts and packages/env/src/web.ts. If you make Clerk keys required there immediately, you’ll effectively disable keyless local dev.

  Avoid

  - Avoid middleware.ts in this Next.js 16 app.
  - Avoid putting real authorization logic only in SignedIn / SignedOut or only in the header UI.
  - Avoid auth.protect() in /api/ai if you want a clean API contract; manual auth() + 401 is clearer for the chat transport.
  - Avoid adding required Clerk env vars to the shared env package unless you are ready to standardize on explicit keys for all devs.
  - Avoid using currentUser() in every request path.

  Apply Here

  - apps/web/src/app/layout.tsx: add ClerkProvider above the existing Providers.
  - apps/web/src/proxy.ts: create route matching and protection for /ai and /api/ai.
  - apps/web/src/components/header.tsx: add auth buttons/user menu and consider prefetch={false} on the /ai link.
  - apps/web/src/app/api/ai/route.ts: enforce auth() and return 401 when unsigned.
  - apps/web/src/app/ai/page.tsx: optionally split into a small server wrapper plus client chat component if you want page-level redirect behavior in addition to proxy protection.
  - packages/env/src/web.ts and packages/env/src/server.ts: only add Clerk env schema if you want explicit-key mode; otherwise leave Clerk out or make dev optional.
  - apps/web/.env: if you go with durable non-keyless setup, add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY there, which matches the repo’s README convention.

  Verify

  - Run bun run dev:web.
  - Signed out: / loads, header shows sign-in/sign-up affordances, /ai redirects or blocks.
  - Signed in: header shows UserButton, /ai loads normally, /api/ai streams.
  - Unsigned POST /api/ai: returns 401.
  - Run bun run check-types.

  Sources

  - Clerk Next.js quickstart: https://clerk.com/docs/getting-started/quickstart
  - Clerk clerkMiddleware() and createRouteMatcher(): https://clerk.com/docs/reference/nextjs/clerk-middleware
  - Clerk App Router auth(): https://clerk.com/docs/reference/nextjs/app-router/auth
  - Clerk App Router route handlers: https://clerk.com/docs/reference/nextjs/app-router/route-handlers
  - Clerk ClerkProvider: https://clerk.com/docs/nextjs/reference/components/clerk-provider
  - Clerk UserButton: https://clerk.com/docs/nextjs/components/user/user-button
  - Clerk SignedIn: https://clerk.com/docs/nextjs/components/control/signed-in
  - Clerk SignInButton: https://clerk.com/docs/nextjs/reference/components/unstyled/sign-in-button
  - Clerk env vars: https://clerk.com/docs/upgrade-guides/api-keys
  - Clerk’s current AI prompt guidance, including keyless note: https://clerk.com/docs/nextjs/guides/ai/prompts
  - Next.js proxy.ts convention: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
  - Next.js middleware-to-proxy rename note: https://nextjs.org/docs/messages/middleware-to-proxy
