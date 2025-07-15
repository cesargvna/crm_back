// src/validators/product.validation.ts

import { z } from "zod";

// Helpers
const codeSchema = z.string().trim().min(1).max(50).toUpperCase();
const barcodeSchema = z.string().trim().max(255).optional().or(z.literal(""));
const nameSchema = z.string().trim().min(1).max(100);
const descriptionSchema = z.string().trim().max(255).optional().or(z.literal(""));
const uuidField = (field: string) =>
  z.string({ required_error: `${field} is required.` }).uuid(`${field} must be a valid UUID.`);

// ✅ Crear Product
export const createProductSchema = z.object({
  code: codeSchema,
  barcode: barcodeSchema,
  name: nameSchema,
  description: descriptionSchema,
  productCategoryId: uuidField("Product Category ID"),
  unitMeasurementId: uuidField("Unit Measurement ID"),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar Product
export const updateProductSchema = z.object({
  code: codeSchema.optional(),
  barcode: barcodeSchema,
  name: nameSchema.optional(),
  description: descriptionSchema,
  productCategoryId: uuidField("Product Category ID").optional(),
  unitMeasurementId: uuidField("Unit Measurement ID").optional(),
});

// ✅ Obtener por Subsidiary
export const getProductsBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getProductByIdSchema = z.object({
  id: uuidField("Product ID"),
});

// ✅ Toggle Status
export const toggleProductStatusParamsSchema = z.object({
  id: uuidField("Product ID"),
});
