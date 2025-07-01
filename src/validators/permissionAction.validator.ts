import { z } from "zod";

const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(/^[a-zA-Z]+$/, "Only letters are allowed. No ñ, spaces, numbers or symbols.");

export const createPermissionActionSchema = z.object({
  name: nameSchema,
});

export const updatePermissionActionSchema = z.object({
  name: nameSchema,
});
