"use client";

import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { buttonVariants } from "@ai20k-demo/ui/components/button";

export default function BillingHeroActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          {<button type="button" className={buttonVariants({ size: "lg" })}>Sign in to upgrade</button>}
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link href="/ai" className={buttonVariants({ size: "lg" })} prefetch={false}>
          Open AI workspace
        </Link>
      </Show>
      <Link
        href="#plans"
        className={buttonVariants({ variant: "outline", size: "lg" })}
        prefetch={false}
      >
        Compare plans
      </Link>
    </div>
  );
}
