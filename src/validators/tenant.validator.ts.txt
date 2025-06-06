import { z } from "zod";

export const tenantSchema = z.object({
  name: z
    .string()
    .min(2, "Name must have at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .nonempty("Name is required."),
  description: z
    .string()
    .max(100, "Description must not exceed 100 characters")
    .optional()
    .nullable(),
  status: z.boolean().optional(),
});

export const updateTenantSchema = tenantSchema.partial().extend({
  id: z.string().uuid("Invalid tenant ID"),
});

export const toggleTenantStatusSchema = z.object({
  id: z.string().uuid("Invalid tenant ID"),
});

export const getAllTenantsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  sortBy: z.enum(["name", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
});
