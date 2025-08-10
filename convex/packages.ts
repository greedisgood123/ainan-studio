import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("packages")
      .withIndex("by_published", q => q.eq("isPublished", true))
      .order("asc")
      .collect();
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
    return await ctx.db.query("packages").withIndex("by_order").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    price: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    addOns: v.array(v.object({ name: v.string(), price: v.string() })),
    isPopular: v.boolean(),
    badge: v.optional(v.string()),
    order: v.number(),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", args.token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const now = Date.now();
    const id = await ctx.db.insert("packages", {
      title: args.title,
      price: args.price,
      description: args.description,
      features: args.features,
      addOns: args.addOns,
      isPopular: args.isPopular,
      badge: args.badge,
      order: args.order,
      isPublished: args.isPublished,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("packages"),
    title: v.optional(v.string()),
    price: v.optional(v.string()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    addOns: v.optional(v.array(v.object({ name: v.string(), price: v.string() }))),
    isPopular: v.optional(v.boolean()),
    badge: v.optional(v.string()),
    order: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, { token, id, ...rest }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    await ctx.db.patch(id, { ...rest, updatedAt: Date.now() });
    return { ok: true };
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("packages") },
  handler: async (ctx, { token, id }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    await ctx.db.delete(id);
    return { ok: true };
  },
});


