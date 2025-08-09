import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const track = mutation({
  args: {
    type: v.string(),
    path: v.string(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analytics_events", {
      ...args,
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

export const recentCounts = query({
  args: { token: v.string(), sinceMs: v.number() },
  handler: async (ctx, { token, sinceMs }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const events = await ctx.db
      .query("analytics_events")
      .withIndex("by_createdAt")
      .filter(q => q.gte(q.field("createdAt"), sinceMs))
      .collect();
    const total = events.length;
    const byPath: Record<string, number> = {};
    for (const e of events) byPath[e.path] = (byPath[e.path] ?? 0) + 1;
    return { total, byPath };
  },
});


