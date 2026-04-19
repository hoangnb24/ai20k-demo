"use client";

import { PricingTable } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@ai20k-demo/ui/components/card";
import { Skeleton } from "@ai20k-demo/ui/components/skeleton";
import { Component, type ReactNode } from "react";

type BillingTableErrorBoundaryProps = {
  children: ReactNode;
};

type BillingTableErrorBoundaryState = {
  error: Error | null;
};

class BillingTableErrorBoundary extends Component<
  BillingTableErrorBoundaryProps,
  BillingTableErrorBoundaryState
> {
  state: BillingTableErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): BillingTableErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      const billingDisabled = this.state.error.message.includes("cannot_render_billing_disabled");

      return (
        <Card className="border border-border bg-background">
          <CardHeader>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Billing Setup
            </p>
            <CardTitle>
              {billingDisabled ? "Enable Clerk Billing to render live plans" : "Billing UI is temporarily unavailable"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {billingDisabled
                ? "The route is wired correctly, but this local Clerk app does not have Billing enabled yet. Turn Billing on in the Clerk Dashboard and this section will render the live PricingTable automatically."
                : "The pricing surface is in place, but Clerk returned an unexpected runtime error while mounting the hosted billing table."}
            </p>
            <p>
              Until that is configured, the rest of the page still works as the public pricing and
              upgrade surface for this repo.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

function PricingTableFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3 border p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function BillingPricingTable() {
  return (
    <BillingTableErrorBoundary>
      <PricingTable fallback={<PricingTableFallback />} />
    </BillingTableErrorBoundary>
  );
}
