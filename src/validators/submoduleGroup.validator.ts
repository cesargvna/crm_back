// src/validators/submoduleGroup.validator.ts

import { z } from "zod";

const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(40, "Name must be at most 40 characters")
  .regex(
    /^[a-zA-Z.]+$/,
    'Only letters and "." are allowed. No ñ, spaces, numbers or symbols'
  );

const routeSchema = z
  .string()
  .min(1, "Route is required")
  .max(255, "Route must be at most 255 characters");

export const createSubmoduleGroupSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  moduleId: z
    .string({ required_error: "Module ID is required" })
    .uuid("Invalid module ID"),
});

export const updateSubmoduleGroupSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  moduleId: z
    .string({ required_error: "Module ID is required" })
    .uuid("Invalid module ID"),
});

export const toggleSubmoduleGroupStatusSchema = z.object({
  status: z.boolean().optional(),
});

export const getAllSubmoduleGroupsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9][0-9]*$/, { message: "Page must be a positive integer >= 1" })
    .optional()
    .default("1"),

  limit: z
    .string()
    .regex(/^[1-9][0-9]*$/, { message: "Limit must be a positive integer" })
    .refine((val) => parseInt(val) <= 500, {
      message: "Limit cannot exceed 500",
    })
    .optional()
    .default("5"),

  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  orderBy: z
    .enum(["name", "created_at", "updated_at"])
    .optional()
    .default("name"),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),
});
