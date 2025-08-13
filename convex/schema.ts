import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex database schema
export default defineSchema({
  signups: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    packageName: v.string(),
    createdAt: v.number(),
    userAgent: v.optional(v.string()),
  }),
  bookings: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    desiredDateMs: v.number(), // start-of-day ms
    packageName: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    status: v.string(), // e.g., "pending", "confirmed", "cancelled"
    createdAt: v.number(),
  }).index("by_desiredDate", ["desiredDateMs"]).index("by_createdAt", ["createdAt"]),
  unavailable_dates: defineTable({
    dateMs: v.number(), // start-of-day ms
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["dateMs"]),
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  admin_sessions: defineTable({
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),
  client_logos: defineTable({
    name: v.string(),
    logoStorageId: v.id("_storage"),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_order", ["order"]),
  analytics_events: defineTable({
    type: v.string(),
    path: v.string(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
  gallery_items: defineTable({
    title: v.string(),
    description: v.string(),
    badge: v.string(),
    iconName: v.string(), // e.g., "Play", "Camera", "Zap"
    imageStorageId: v.optional(v.id("_storage")),
    order: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["order"]).index("by_published", ["isPublished","order"]),
  portfolio_items: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(), // "Weddings" | "Corporate" | "Livefeed"
    imageStorageId: v.id("_storage"),
    order: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["order"]).index("by_category", ["category","order"]).index("by_published", ["isPublished","order"]),
  // New album-based portfolio schema
  portfolio_albums: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(), // "Weddings" | "Corporate" | "Livefeed"
    coverImageStorageId: v.optional(v.id("_storage")),
    order: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["order"]).index("by_category", ["category","order"]).index("by_published", ["isPublished","order"]),
  portfolio_photos: defineTable({
    albumId: v.id("portfolio_albums"),
    imageStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_album", ["albumId","order"]),
  packages: defineTable({
    title: v.string(),
    price: v.string(),
    description: v.string(),
    features: v.array(v.string()),
    addOns: v.array(v.object({ name: v.string(), price: v.string() })),
    isPopular: v.boolean(),
    badge: v.optional(v.string()),
    order: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_order", ["order"]).index("by_published", ["isPublished","order"]),
});


