// src/validators/unitMeasurement.validation.ts

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

// ✅ Crear UnitMeasurement
export const createUnitMeasurementSchema = z.object({
  name: nameSchema,
  quantity: z.number().min(1, "Quantity must be greater than zero."),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar UnitMeasurement
export const updateUnitMeasurementSchema = z.object({
  name: nameSchema.optional(),
  quantity: z.number().min(1).optional(),
});

// ✅ Obtener por Subsidiary
export const getUnitMeasurementsBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getUnitMeasurementByIdSchema = z.object({
  id: uuidField("UnitMeasurement ID"),
});

// ✅ Toggle Status
export const toggleUnitMeasurementStatusParamsSchema = z.object({
  id: uuidField("UnitMeasurement ID"),
});
