import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  // Avoid throwing during build; log a clear error for dev
  // eslint-disable-next-line no-console
  console.error("Missing VITE_CONVEX_URL. Start `npx convex dev` and set env.");
}

export const convex = new ConvexReactClient(convexUrl ?? "");


