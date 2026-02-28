// Shared TypeScript types for Foodyz
// Prisma-generated types are imported directly from "@prisma/client"
// Add hand-written utility types and component prop unions here.

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
