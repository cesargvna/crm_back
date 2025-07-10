import { z } from "zod";

// ✔ name: minúsculas, sin tildes ni ñ, normalizado en controller.
// Longitud: 1–50 caracteres.
const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name must be at least 1 character" })
  .max(50, { message: "Name must be at most 50 characters." });

// ✔ description: opcional, máximo 100 caracteres.
const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

// ✔ UUIDs
const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .uuid(`${field} must be a valid UUID`);

// ✅ Crear ExpenseCategory
export const createExpenseCategorySchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Actualizar ExpenseCategory
export const updateExpenseCategorySchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
});

// ✅ Toggle status solo necesita param ID
export const toggleExpenseCategoryStatusParamsSchema = z.object({
  id: z.string().uuid("Invalid expense category ID."),
});

// ✅ Obtener por ID
export const getExpenseCategoryByIdSchema = z.object({
    id: z.string().uuid("Invalid expense category ID."),
});

// ✅ Obtener por Subsidiary con filtros
export const getExpenseCategoriesBySubsidiarySchema = z.object({
  subsidiaryId: z.string().uuid("Invalid subsidiary ID."),
});