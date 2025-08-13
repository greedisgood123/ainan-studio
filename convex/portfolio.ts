import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPublic = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    // Albums-first public API: return albums with cover URLs
    const base = ctx.db
      .query("portfolio_albums")
      .withIndex("by_published", q => q.eq("isPublished", true))
      .order("asc");
    const albums = await base.collect();
    const filtered = category && category !== "All" ? albums.filter(a => a.category === category) : albums;
    const withCover = await Promise.all(filtered.map(async (a) => ({
      ...a,
      coverUrl: a.coverImageStorageId ? await ctx.storage.getUrl(a.coverImageStorageId) : undefined,
    })));
    return withCover;
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
    const albums = await ctx.db.query("portfolio_albums").withIndex("by_order").order("asc").collect();
    const withCover = await Promise.all(albums.map(async (a) => ({
      ...a,
      coverUrl: a.coverImageStorageId ? await ctx.storage.getUrl(a.coverImageStorageId) : undefined,
    })));
    return withCover;
  },
});

// Create single-image legacy item (kept for compatibility)
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

// New: album APIs
export const createAlbum = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    coverImageStorageId: v.optional(v.id("_storage")),
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
    const { token: _token, ...rest } = args;
    const id = await ctx.db.insert("portfolio_albums", { ...rest, createdAt: now, updatedAt: now });
    // If a cover image is provided, create an initial photo so the album has at least one image
    if (rest.coverImageStorageId) {
      await ctx.db.insert("portfolio_photos", {
        albumId: id,
        imageStorageId: rest.coverImageStorageId,
        caption: rest.description,
        order: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { id };
  },
});

export const updateAlbum = mutation({
  args: {
    token: v.string(),
    id: v.id("portfolio_albums"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
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

// Accept uploading a file via `update` call by first generating an upload URL client side,
// then passing `coverImageStorageId` to this mutation. The admin UI already handles this.

export const removeAlbum = mutation({
  args: { token: v.string(), id: v.id("portfolio_albums") },
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

export const listAlbumPhotos = query({
  args: { token: v.optional(v.string()), albumId: v.id("portfolio_albums") },
  handler: async (ctx, { albumId }) => {
    const photos = await ctx.db
      .query("portfolio_photos")
      .withIndex("by_album", q => q.eq("albumId", albumId))
      .order("asc")
      .collect();
    if (photos.length === 0) {
      // Fallback: if no photos yet, serve the album cover as a single photo
      const album = await ctx.db.get(albumId);
      if (album?.coverImageStorageId) {
        const url = await ctx.storage.getUrl(album.coverImageStorageId);
        return [{
          _id: albumId as any,
          albumId,
          imageStorageId: album.coverImageStorageId,
          caption: album.description,
          order: 0,
          createdAt: album.createdAt,
          updatedAt: album.updatedAt,
          imageUrl: url,
          _creationTime: Date.now(),
        } as any];
      }
      return [];
    }
    const withUrls = await Promise.all(photos.map(async p => ({
      ...p,
      imageUrl: await ctx.storage.getUrl(p.imageStorageId),
    })));
    return withUrls;
  },
});

export const addPhoto = mutation({
  args: {
    token: v.string(),
    albumId: v.id("portfolio_albums"),
    imageStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", args.token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");
    const now = Date.now();
    const { token: _token, ...rest } = args;
    const id = await ctx.db.insert("portfolio_photos", { ...rest, createdAt: now, updatedAt: now });
    return { id };
  },
});

export const updatePhoto = mutation({
  args: {
    token: v.string(),
    id: v.id("portfolio_photos"),
    caption: v.optional(v.string()),
    order: v.optional(v.number()),
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

export const removePhoto = mutation({
  args: { token: v.string(), id: v.id("portfolio_photos") },
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


