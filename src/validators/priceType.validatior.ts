import { z } from "zod";

// Helpers
const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character.")
  .max(50, "Name must be at most 50 characters.");

const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .uuid(`${field} must be a valid UUID.`);

// ✅ Crear PriceType
export const createPriceTypeSchema = z.object({
  name: nameSchema,
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar PriceType
export const updatePriceTypeSchema = z.object({
  name: nameSchema.optional(),
});

// ✅ Obtener por Subsidiary
export const getPriceTypesBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getPriceTypeByIdSchema = z.object({
  id: uuidField("PriceType ID"),
});

// ✅ Toggle Status
export const togglePriceTypeStatusParamsSchema = z.object({
  id: uuidField("PriceType ID"),
});
