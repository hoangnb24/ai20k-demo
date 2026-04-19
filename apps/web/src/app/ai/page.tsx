import { auth } from "@clerk/nextjs/server";

import AIChat from "@/components/ai-chat";
import { PREMIUM_FEATURE_KEY } from "@/lib/billing";

export default async function AIPage() {
  const { has, userId } = await auth();
  const isPremium = Boolean(userId && has({ feature: PREMIUM_FEATURE_KEY }));

  return <AIChat isPremium={isPremium} />;
}
