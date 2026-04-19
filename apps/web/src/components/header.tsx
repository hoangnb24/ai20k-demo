"use client";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@ai20k-demo/ui/components/button";

import { ModeToggle } from "./mode-toggle";
import { BILLING_ROUTE } from "@/lib/billing";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          <Link href="/">Home</Link>
          <Link href={BILLING_ROUTE} prefetch={false}>
            Billing
          </Link>
          <Link href="/ai" prefetch={false}>
            AI Chat
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className={buttonVariants({ variant: "outline", size: "sm" })}>Sign in</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
