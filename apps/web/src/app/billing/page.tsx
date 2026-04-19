import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ai20k-demo/ui/components/card";

import BillingHeroActions from "@/components/billing-hero-actions";
import BillingPricingTable from "@/components/billing-pricing-table";
import { PREMIUM_FEATURE_KEY } from "@/lib/billing";

const BILLING_FEATURES = [
  "Public pricing page for evaluation and upgrade flows",
  "Upgrade and subscription management through Clerk Billing",
  "Server-side feature checks ready for premium-only surfaces",
];

export default async function BillingPage() {
  const { has, userId } = await auth();
  const hasPremiumAccess = Boolean(userId && has({ feature: PREMIUM_FEATURE_KEY }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-6">
          <div className="space-y-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Billing
            </p>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Plans that let the demo start free and scale into premium without a billing rewrite.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Keep the public marketing surface simple, let Clerk own checkout and subscription
                management, and wire premium access into the app with server-side feature checks
                when you are ready to gate higher-tier experiences.
              </p>
            </div>
          </div>

          <BillingHeroActions />

          <div className="grid gap-4 md:grid-cols-3">
            {BILLING_FEATURES.map((feature) => (
              <Card key={feature} className="border border-border bg-card/70">
                <CardHeader>
                  <CardTitle className="text-base">{feature}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Card className="border border-border bg-background">
          <CardHeader>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Premium Signal
            </p>
            <CardTitle>
              {hasPremiumAccess ? "Premium access is active" : "Premium access is not active yet"}
            </CardTitle>
            <CardDescription>
              This card is rendered from a server-side Clerk entitlement check using the{" "}
              <code>{PREMIUM_FEATURE_KEY}</code> feature key.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {hasPremiumAccess
                ? "The current user already satisfies the premium feature check, so premium-only surfaces can branch safely from the server."
                : userId
                  ? "The current user is signed in but does not yet satisfy the premium feature check. This is the state we can use for upgrade prompts and future plan gating."
                  : "This route stays public. Sign in to see your current entitlement state and let Clerk Billing handle upgrades."}
            </p>
            <p>
              Plans and features are configured in the Clerk Dashboard, while the app reads the
              result server-side with <code>auth().has()</code>.
            </p>
          </CardContent>
        </Card>
      </div>

      <section id="plans" className="mt-10 space-y-4 border-t pt-8">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Pricing Table
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Choose the plan that fits the surface you want to ship.</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            This page uses Clerk’s Billing UI directly so subscription changes stay in the hosted
            flow instead of forcing the repo into a custom Stripe backend before it is needed.
          </p>
        </div>

        <div className="border border-border bg-card/60 p-4 sm:p-6">
          <BillingPricingTable />
        </div>
      </section>
    </div>
  );
}
