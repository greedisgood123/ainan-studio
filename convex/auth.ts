import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Public: allow creating the very first admin only. After one exists, this is disabled.
export const registerFirstAdmin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const anyAdmin = await ctx.db.query("admins").first();
    if (anyAdmin) throw new Error("Registration closed");
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();
    if (existing) throw new Error("Email already in use");
    const passwordHash = bcrypt.hashSync(password, 10);
    const adminId = await ctx.db.insert("admins", {
      email,
      passwordHash,
      createdAt: Date.now(),
    });
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + SESSION_TTL_MS;
    await ctx.db.insert("admin_sessions", { adminId, token, createdAt: now, expiresAt });
    return { token, expiresAt };
  },
});

// Reverted to argument-based seeding
export const seedAdmin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();
    if (existing) return { ok: true };
    const passwordHash = await bcrypt.hash(password, 10);
    await ctx.db.insert("admins", {
      email,
      passwordHash,
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();
    if (!admin) throw new Error("Invalid credentials");
    const ok = bcrypt.compareSync(password, admin.passwordHash);
    if (!ok) throw new Error("Invalid credentials");
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + SESSION_TTL_MS;
    await ctx.db.insert("admin_sessions", {
      adminId: admin._id,
      token,
      createdAt: now,
      expiresAt,
    });
    return { token, expiresAt };
  },
});

export const me = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    const admin = await ctx.db.get(session.adminId);
    if (!admin) return null;
    return { email: admin.email };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return { ok: true };
  },
});


