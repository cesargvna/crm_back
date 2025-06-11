import { z } from "zod";

const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(
    /^[A-Za-z\u00C0-\u017F\sñÑ.-]+$/,
    'Only letters, spaces, ".", and "-" are allowed'
  );

const descriptionSchema = z
  .string()
  .max(100, "Description must be at most 100 characters")
  .optional();

export const createTenantSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateTenantSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const toggleTenantStatusSchema = z.object({
  status: z.boolean().optional(),
});

export const getAllTenantsQuerySchema = z.object({
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
