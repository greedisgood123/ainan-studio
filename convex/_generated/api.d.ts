/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as clientLogos from "../clientLogos.js";
import type * as files from "../files.js";
import type * as gallery from "../gallery.js";
import type * as packages from "../packages.js";
import type * as portfolio from "../portfolio.js";
import type * as signups from "../signups.js";
import type * as unavailableDates from "../unavailableDates.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  bookings: typeof bookings;
  clientLogos: typeof clientLogos;
  files: typeof files;
  gallery: typeof gallery;
  packages: typeof packages;
  portfolio: typeof portfolio;
  signups: typeof signups;
  unavailableDates: typeof unavailableDates;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
