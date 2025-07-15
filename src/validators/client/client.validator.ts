import { z } from "zod";

// Helpers
const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character.")
  .max(50, "Name must be at most 50 characters.");

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

// ✅ Crear Client
export const createClientSchema = z.object({
  name: nameSchema,
  lastname: optionalString(20),
  ci: optionalString(20),
  nit: optionalString(20),
  description: optionalString(100),
  address: optionalString(100),
  cellphone: optionalString(20),
  telephone: optionalString(20),
  email: optionalEmail,
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
  clientCategoryId: uuidField("Client Category ID"),
});

// ✅ Actualizar Client
export const updateClientSchema = z.object({
  name: nameSchema.optional(),
  lastname: optionalString(20),
  ci: optionalString(20),
  nit: optionalString(20),
  description: optionalString(100),
  address: optionalString(100),
  cellphone: optionalString(20),
  telephone: optionalString(20),
  email: optionalEmail,
  clientCategoryId: uuidField("Client Category ID").optional(),
});

// ✅ Obtener por Subsidiary
export const getClientsBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ Obtener por ID
export const getClientByIdSchema = z.object({
  id: uuidField("Client ID"),
});

// ✅ Toggle Status
export const toggleClientStatusParamsSchema = z.object({
  id: uuidField("Client ID"),
});