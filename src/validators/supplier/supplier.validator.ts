import { z } from "zod";

// Helpers reutilizables
const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character.")
  .max(100, "Name must be at most 100 characters.");

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

const optionalEmail = z
  .string()
  .trim()
  .email("Invalid email format.")
  .optional()
  .or(z.literal(""));

const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .uuid(`${field} must be a valid UUID.`);

// ✅ Crear Supplier
export const createSupplierSchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  company: optionalString(100),
  phone: optionalString(20),
  telephone: optionalString(20),
  email: optionalEmail,
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
  supplierCategoryId: uuidField("Supplier Category ID"),
});

// ✅ Actualizar Supplier
export const updateSupplierSchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
  company: optionalString(100),
  phone: optionalString(20),
  telephone: optionalString(20),
  email: optionalEmail,
  supplierCategoryId: uuidField("Supplier Category ID").optional(),
});

// ✅ Obtener por Subsidiary
export const getSuppliersBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getSupplierByIdSchema = z.object({
  id: uuidField("Supplier ID"),
});

// ✅ Toggle Status
export const toggleSupplierStatusParamsSchema = z.object({
  id: uuidField("Supplier ID"),
});
