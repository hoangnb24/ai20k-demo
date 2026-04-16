"use client";
import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          <Link href="/">Home</Link>
          <Link href="/ai" prefetch={false}>
            AI Chat
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-3 py-1 rounded border">Sign in</button>
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
