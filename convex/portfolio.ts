import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPublic = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    const base = ctx.db
      .query("portfolio_items")
      .withIndex("by_published", q => q.eq("isPublished", true))
      .order("asc");
    const items = await base.collect();
    const filtered = category && category !== "All" ? items.filter(i => i.category === category) : items;
    const withUrls = await Promise.all(filtered.map(async (i) => ({
      ...i,
      imageUrl: await ctx.storage.getUrl(i.imageStorageId),
    })));
    return withUrls;
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
    const items = await ctx.db.query("portfolio_items").withIndex("by_order").order("asc").collect();
    const withUrls = await Promise.all(
      items.map(async (i) => ({
        ...i,
        imageUrl: await ctx.storage.getUrl(i.imageStorageId),
      }))
    );
    return withUrls;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    imageStorageId: v.id("_storage"),
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
    const id = await ctx.db.insert("portfolio_items", {
      title: args.title,
      description: args.description,
      category: args.category,
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
    id: v.id("portfolio_items"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
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
  args: { token: v.string(), id: v.id("portfolio_items") },
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


