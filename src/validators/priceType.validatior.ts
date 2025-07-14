import { z } from "zod";

// Helper para UUID
const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .uuid(`${field} must be a valid UUID.`);

const nameSchema = z.string().trim().min(1).max(50);

export const createPriceTypeSchema = z.object({
  name: nameSchema,
  marginPercent: z.number().min(0).max(100, "Margin must be <= 100"),
  tenantId: z.string().min(1),
  subsidiaryId: uuidField("Subsidiary ID"),
});

export const updatePriceTypeSchema = z.object({
  name: nameSchema.optional(),
  marginPercent: z.number().min(0).max(100).optional(),
});

export const getPriceTypesBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

export const getPriceTypeByIdSchema = z.object({
  id: uuidField("PriceType ID"),
});

export const togglePriceTypeStatusParamsSchema = z.object({
  id: uuidField("PriceType ID"),
});
