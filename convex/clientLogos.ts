import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("client_logos").withIndex("by_order").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    logoStorageId: v.id("_storage"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", args.token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const id = await ctx.db.insert("client_logos", {
      name: args.name,
      logoStorageId: args.logoStorageId,
      order: args.order,
      createdAt: Date.now(),
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("client_logos"),
    name: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { token, id, ...rest }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    await ctx.db.patch(id, rest);
    return { ok: true };
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("client_logos") },
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

export const exportJson = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const logos = await ctx.db.query("client_logos").withIndex("by_order").order("asc").collect();
    // Include a temporary URL for convenience
    const withUrls = await Promise.all(
      logos.map(async (l) => ({
        _id: l._id,
        name: l.name,
        order: l.order,
        logoStorageId: l.logoStorageId,
        url: await ctx.storage.getUrl(l.logoStorageId),
      }))
    );
    return withUrls;
  },
});


