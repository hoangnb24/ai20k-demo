import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { streamText, type UIMessage, convertToModelMessages, wrapLanguageModel } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  await auth.protect();

  const { messages }: { messages: UIMessage[] } = await req.json();

  const model = wrapLanguageModel({
    model: google("gemini-2.5-flash"),
    middleware: devToolsMiddleware(),
  });
  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
