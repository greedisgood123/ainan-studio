import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
    system: v.optional(v.string()),
    provider: v.optional(v.string()), // e.g., "groq" | "openai"
  },
  handler: async (ctx, args) => {
    "use node";

    // Default to Groq (open-source model hosting). You can switch via args.provider
    const provider = (args.provider || "groq").toLowerCase();

    // Fetch grounding data from Convex
    const [packages, unavailableDays] = await Promise.all([
      ctx.runQuery(api.packages.listPublic, {} as any),
      ctx.runQuery(api.unavailableDates.publicDays, {} as any),
    ]);

    // Build concise context
    const packagesSummary = Array.isArray(packages)
      ? packages
          .map((p: any) => {
            const features = Array.isArray(p.features)
              ? p.features.slice(0, 5).join(", ")
              : "";
            const badge = p.badge ? ` [${p.badge}]` : "";
            return `- ${p.title}${badge} — ${p.price}. ${p.description || ""}${features ? ` Features: ${features}.` : ""}`;
          })
          .join("\n")
      : "";
    const upcomingBlocked = Array.isArray(unavailableDays)
      ? (unavailableDays as number[])
          .filter((ms: number) => ms >= startOfTodayMs())
          .slice(0, 30)
          .map((ms: number) => new Date(ms).toISOString().slice(0, 10))
          .join(", ")
      : "";
    const dataContext =
      `Business data for answers (keep replies brief):\n` +
      (packagesSummary ? `Packages:\n${packagesSummary}\n` : "") +
      (upcomingBlocked ? `Unavailable dates (next): ${upcomingBlocked}\n` : "");

    if (provider === "groq") {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing GROQ_API_KEY");

      const systemPrefix = [
        { role: "system", content: dataContext },
        ...(args.system ? [{ role: "system", content: args.system }] : []),
      ];

      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [...systemPrefix, ...args.messages],
            temperature: 0.2,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`LLM request failed (${res.status}): ${text}`);
      }
      const json = (await res.json()) as any;
      const content = json?.choices?.[0]?.message?.content ?? "";
      return { content };
    }

    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

      const systemPrefix = [
        { role: "system", content: dataContext },
        ...(args.system ? [{ role: "system", content: args.system }] : []),
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [...systemPrefix, ...args.messages],
          temperature: 0.2,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`LLM request failed (${res.status}): ${text}`);
      }
      const json = (await res.json()) as any;
      const content = json?.choices?.[0]?.message?.content ?? "";
      return { content };
    }

    throw new Error(`Unsupported provider: ${provider}`);
  },
});

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}


