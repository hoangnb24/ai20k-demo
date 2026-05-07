import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai20k-demo/ui/components/card";
import { buttonVariants } from "@ai20k-demo/ui/components/button";

import { BILLING_ROUTE } from "@/lib/billing";

const TITLE_TEXT = `
HELLO WORLD
 `;

export default function Home() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <pre aria-hidden="true" className="overflow-x-auto font-mono text-sm">
        {TITLE_TEXT}
      </pre>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border border-border bg-card/60">
          <CardHeader>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Product Surface
            </p>
            <CardTitle className="text-2xl leading-tight sm:text-3xl">
              Ship the AI demo fast, then turn premium access on when the product is ready.
            </CardTitle>
            <CardDescription>
              Auth is already in place, the chat route is already protected, and billing now has a
              public entry point for pricing, upgrades, and future feature gating.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/ai" className={buttonVariants({ size: "lg" })} prefetch={false}>
              Open AI chat
            </Link>
            <Link
              href={BILLING_ROUTE}
              className={buttonVariants({ variant: "outline", size: "lg" })}
              prefetch={false}
            >
              Explore plans
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-border bg-background">
          <CardHeader>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Billing-Ready
            </p>
            <CardTitle>Clerk Billing, not a custom Stripe detour</CardTitle>
            <CardDescription>
              The pricing route is public, upgrade flows stay inside Clerk, and premium-ready checks
              can branch from a server-side feature key.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Public pricing page at <code>/billing</code>.</p>
            <p>Signed-in users can manage upgrades through Clerk Billing UI.</p>
            <p>The AI surface already reads a server-safe premium entitlement signal.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
