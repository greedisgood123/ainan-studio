import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    packageName: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Basic rate limiting by IP in the future can be added with an action; keeping simple for Phase 1
    const createdAt = Date.now();
    const id = await ctx.db.insert("signups", { ...args, createdAt });
    return { id };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    // For Phase 2 we will restrict to admin identities
    return await ctx.db.query("signups").order("desc").collect();
  },
});


