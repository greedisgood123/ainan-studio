import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function startOfDayMs(timestampMs: number): number {
  const d = new Date(timestampMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    return await ctx.db.query("unavailable_dates").withIndex("by_date").order("asc").collect();
  },
});

export const block = mutation({
  args: { token: v.string(), dateMs: v.number(), reason: v.optional(v.string()) },
  handler: async (ctx, { token, dateMs, reason }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const day = startOfDayMs(dateMs);
    const existing = await ctx.db
      .query("unavailable_dates")
      .withIndex("by_date", q => q.eq("dateMs", day))
      .unique();
    if (existing) return { id: existing._id };
    const id = await ctx.db.insert("unavailable_dates", { dateMs: day, reason, createdAt: Date.now() });
    return { id };
  },
});

export const unblock = mutation({
  args: { token: v.string(), dateMs: v.number() },
  handler: async (ctx, { token, dateMs }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const day = startOfDayMs(dateMs);
    const existing = await ctx.db
      .query("unavailable_dates")
      .withIndex("by_date", q => q.eq("dateMs", day))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return { ok: true };
  },
});

export const publicDays = query({
  args: {},
  handler: async (ctx) => {
    const blocked = await ctx.db.query("unavailable_dates").withIndex("by_date").order("asc").collect();
    const bookings = await ctx.db.query("bookings").withIndex("by_desiredDate").order("asc").collect();
    const set = new Set<number>();
    for (const b of blocked) set.add(b.dateMs);
    for (const bk of bookings) set.add(bk.desiredDateMs);
    return Array.from(set.values()).sort((a,b) => a - b);
  },
});


