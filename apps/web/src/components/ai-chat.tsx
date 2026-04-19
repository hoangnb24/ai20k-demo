"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@ai20k-demo/ui/components/button";
import { Input } from "@ai20k-demo/ui/components/input";
import { buttonVariants } from "@ai20k-demo/ui/components/button";
import { DefaultChatTransport } from "ai";
import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Streamdown } from "streamdown";

import { BILLING_ROUTE } from "@/lib/billing";

type AIChatProps = {
  isPremium: boolean;
};

export default function AIChat({ isPremium }: AIChatProps) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
    }),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="border-b px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              AI Workspace
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4" />
              <span className="font-medium">
                {isPremium ? "Premium access detected" : "Standard access active"}
              </span>
            </div>
            <p className="max-w-2xl text-xs text-muted-foreground">
              {isPremium
                ? "This session is already entitled for premium-ready surfaces. Future plan-gated capabilities can branch from this server-side check."
                : "This chat stays available, but premium-only capabilities can now branch from a server-side feature check. Upgrade when you are ready to gate higher-tier flows."}
            </p>
          </div>

          <Link
            href={BILLING_ROUTE}
            className={buttonVariants({
              variant: isPremium ? "secondary" : "default",
              size: "sm",
            })}
            prefetch={false}
          >
            {isPremium ? "Manage billing" : "Upgrade to premium"}
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl grid-rows-[1fr] overflow-hidden p-4">
        <div
          className="overflow-y-auto space-y-4 pb-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.length === 0 ? (
            <div className="mt-8 text-center text-muted-foreground">
              Ask me anything to get started!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-3 ${
                  message.role === "user" ? "ml-8 bg-primary/10" : "mr-8 bg-secondary/20"
                }`}
              >
                <p className="mb-1 text-sm font-semibold">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </p>
                {message.parts?.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <Streamdown
                        key={index}
                        isAnimating={status === "streaming" && message.role === "assistant"}
                      >
                        {part.text}
                      </Streamdown>
                    );
                  }
                  return null;
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t px-4 py-2">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-5xl items-center space-x-2"
        >
          <Input
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            autoFocus
          />
          <Button type="submit" size="icon" aria-label="Send message">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
