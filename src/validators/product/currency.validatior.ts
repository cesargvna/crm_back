import { z } from "zod";

const nameSchema = z.string().trim().min(1).max(50);
const codeSchema = z.string().trim().min(1).max(10).toUpperCase();
const uuidField = (field: string) =>
  z.string({ required_error: `${field} is required.` }).uuid(`${field} must be a valid UUID.`);

// ✅ Crear
export const createCurrencySchema = z.object({
  name: nameSchema,
  code: codeSchema,
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar
export const updateCurrencySchema = z.object({
  name: nameSchema.optional(),
  code: codeSchema.optional(),
});

// ✅ Obtener por Subsidiary
export const getCurrenciesBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getCurrencyByIdSchema = z.object({
  id: uuidField("Currency ID"),
});

// ✅ Toggle Status
export const toggleCurrencyStatusParamsSchema = z.object({
  id: uuidField("Currency ID"),
});
