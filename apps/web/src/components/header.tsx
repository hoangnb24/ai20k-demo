"use client";

import { Button } from "@ai20k-demo/ui/components/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const { isLoaded, isSignedIn } = useAuth();
  const links = [
    { to: "/", label: "Home" },
    { to: "/ai", label: "AI Chat" },
  ] as const;
  const showSignedOutControls = !isLoaded || !isSignedIn;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {showSignedOutControls ? (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
          {showSignedOutControls ? (
            <SignUpButton mode="modal">
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          ) : null}
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
