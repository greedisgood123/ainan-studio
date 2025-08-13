import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// Types are intentionally loosened here to bypass a DataModel typing mismatch during dev

// Public: get hero media URLs for the landing page
export const getHero = query({
  args: {},
  handler: async (ctx) => {
    // Fallback to a table scan to avoid depending on a missing index in dev
    const rows = (await (ctx.db as any)
      .query("site_settings")
      .collect()) as any[];
    const row = rows.find((r: any) => r?.key === "hero") ?? null;
    if (!row) return {};
    // Return signed absolute URLs so it works on production hosts (e.g., Netlify)
    const mp4Url = row?.mp4StorageId ? await (ctx.storage as any).getUrl(row.mp4StorageId as any) : undefined;
    const webmUrl = row?.webmStorageId ? await (ctx.storage as any).getUrl(row.webmStorageId as any) : undefined;
    const posterUrl = row?.posterStorageId ? await (ctx.storage as any).getUrl(row.posterStorageId as any) : undefined;
    return { mp4Url, webmUrl, posterUrl };
  },
});

// Admin: set hero media storage IDs
export const setHeroVideo = mutation({
  args: {
    token: v.string(),
    mp4StorageId: v.optional(v.id("_storage")),
    webmStorageId: v.optional(v.id("_storage")),
    posterStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { token, mp4StorageId, webmStorageId, posterStorageId }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) throw new Error("Unauthorized");

    const rows = (await (ctx.db as any)
      .query("site_settings")
      .collect()) as any[];
    const existing = rows.find((r: any) => r?.key === "hero") ?? null;
    const payload: any = {
      key: "hero",
      updatedAt: Date.now(),
    };
    if (mp4StorageId !== undefined) payload.mp4StorageId = mp4StorageId;
    if (webmStorageId !== undefined) payload.webmStorageId = webmStorageId;
    if (posterStorageId !== undefined) payload.posterStorageId = posterStorageId;

    if (existing) {
      await (ctx.db as any).patch(existing._id as any, payload as any);
      return { ok: true };
    }
    await (ctx.db as any).insert("site_settings", payload as any);
    return { ok: true };
  },
});


