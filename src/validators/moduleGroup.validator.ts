// src/validators/moduleGroup.validator.ts
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

const iconNameSchema = z
  .string()
  .min(1, "Icon name is required")
  .max(100, "Icon name must be at most 100 characters");

export const createModuleGroupSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  iconName: iconNameSchema,
  sectionId: z
    .string({ required_error: "Section ID is required" })
    .uuid("Invalid section ID"),
});

export const updateModuleGroupSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  iconName: iconNameSchema,
  sectionId: z
    .string({ required_error: "Section ID is required" })
    .uuid("Invalid section ID"),
});

export const toggleModuleGroupStatusSchema = z.object({
  status: z.boolean().optional(),
});

export const getAllModuleGroupsQuerySchema = z.object({
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
