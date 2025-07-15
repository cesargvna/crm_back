import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character")
  .max(50, "Name must be at most 50 characters.");

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .uuid(`${field} must be a valid UUID`);

export const createIncomeCategorySchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

export const updateIncomeCategorySchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
});

export const getIncomeCategoriesBySubsidiarySchema = z.object({
  subsidiaryId: z.string().uuid("Invalid subsidiary ID."),
});

export const getIncomeCategoryByIdSchema = z.object({
  id: z.string().uuid("Invalid income category ID."),
});

export const toggleIncomeCategoryStatusParamsSchema = z.object({
  id: z.string().uuid("Invalid income category ID."),
});
