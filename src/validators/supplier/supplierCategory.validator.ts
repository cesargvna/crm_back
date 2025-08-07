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

// ✅ Crear SupplierCategory
export const createSupplierCategorySchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar SupplierCategory
export const updateSupplierCategorySchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
});

// ✅ Obtener por Subsidiary
export const getSupplierCategoriesBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getSupplierCategoryByIdSchema = z.object({
  id: uuidField("Supplier Category ID"),
});

// ✅ Toggle Status
export const toggleSupplierCategoryStatusParamsSchema = z.object({
  id: uuidField("Supplier Category ID"),
});
