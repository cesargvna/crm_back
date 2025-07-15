// src/validators/clientCategory.schema.ts

import { z } from "zod";

// 🔵 Helpers reutilizables
const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character.")
  .max(50, "Name must be at most 50 characters.");

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .uuid(`${field} must be a valid UUID.`);

// ✅ Crear ClientCategory
export const createClientCategorySchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar ClientCategory
export const updateClientCategorySchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
});

// ✅ Obtener por Subsidiary
export const getClientCategoriesBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getClientCategoryByIdSchema = z.object({
  id: uuidField("Client Category ID"),
});

// ✅ Toggle Status
export const toggleClientCategoryStatusParamsSchema = z.object({
  id: uuidField("Client Category ID"),
});
