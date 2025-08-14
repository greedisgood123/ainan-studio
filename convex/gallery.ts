import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Public list: published only, ordered
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    // Derive gallery from latest published portfolio items by category.
    const portfolio = await ctx.db
      .query("portfolio_items")
      .withIndex("by_published", q => q.eq("isPublished", true))
      .order("asc")
      .collect();
    // Return a reasonable number for the public gallery grid
    const subset = portfolio.slice(0, 9);
    const mapped = await Promise.all(subset.map(async (p) => ({
      title: p.title,
      description: p.description,
      badge: p.category === "Weddings" ? "Event" : (p.category === "Corporate" ? "Corporate" : "Live feed"),
      iconName: p.category === "Weddings" ? "Camera" : (p.category === "Corporate" ? "Zap" : "Play"),
      imageUrl: await ctx.storage.getUrl(p.imageStorageId),
    })));
    return mapped;
  },
});

// Admin list: all items
export const listAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    return await ctx.db.query("gallery_items").withIndex("by_order").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    badge: v.string(),
    iconName: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
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
    const id = await ctx.db.insert("gallery_items", {
      title: args.title,
      description: args.description,
      badge: args.badge,
      iconName: args.iconName,
      imageStorageId: args.imageStorageId,
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
    id: v.id("gallery_items"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    badge: v.optional(v.string()),
    iconName: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
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
  args: { token: v.string(), id: v.id("gallery_items") },
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


