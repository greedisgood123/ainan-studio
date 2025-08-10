import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function startOfDayMs(timestampMs: number): number {
  const d = new Date(timestampMs);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    desiredDateMs: v.number(),
    packageName: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const desiredDay = startOfDayMs(args.desiredDateMs);

    // Check blocked dates
    const blocked = await ctx.db
      .query("unavailable_dates")
      .withIndex("by_date", q => q.eq("dateMs", desiredDay))
      .unique();
    if (blocked) throw new Error("Selected date is unavailable.");

    // Optionally ensure only one booking per day (or adjust logic as needed)
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_desiredDate", q => q.eq("desiredDateMs", desiredDay))
      .collect();
    if (existing.length > 0) throw new Error("This date is already booked.");

    const now = Date.now();
    const id = await ctx.db.insert("bookings", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      desiredDateMs: desiredDay,
      packageName: args.packageName,
      userAgent: args.userAgent,
      status: "pending",
      createdAt: now,
    });
    return { id };
  },
});

export const listAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    return await ctx.db.query("bookings").withIndex("by_createdAt").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: { token: v.string(), id: v.id("bookings"), status: v.string() },
  handler: async (ctx, { token, id, status }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    await ctx.db.patch(id, { status });
    return { ok: true };
  },
});


