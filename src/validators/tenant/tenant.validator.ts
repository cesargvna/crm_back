import { z } from "zod";

// ✅ Nombre: al menos 3 letras, máximo 50, permitidos letras, números, puntos, comas, guiones, espacios
export const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(
    /^[A-Za-z0-9.,\-\s]+$/,
    'Only letters, numbers, ".", ",", "-", and spaces are allowed'
  );

// ✅ Descripción: cualquier cosa, hasta 100 caracteres
export const descriptionSchema = z
  .string()
  .max(100, "Description must be at most 100 characters")
  .optional();

// ✅ Reglas genéricas para límites
const limitsSchema = {
  maxSubsidiaries: z
    .number({ invalid_type_error: "maxSubsidiaries must be a number" })
    .int()
    .min(1, "Must be at least 1")
    .optional()
    .default(1),

  maxUsers: z
    .number({ invalid_type_error: "maxUsers must be a number" })
    .int()
    .min(1, "Must be at least 1")
    .optional()
    .default(3),

  maxRoles: z
    .number({ invalid_type_error: "maxRoles must be a number" })
    .int()
    .min(1, "Must be at least 1")
    .optional()
    .default(3),
};

// ✅ Crear
export const createTenantSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  ...limitsSchema,
});

// ✅ Actualizar
export const updateTenantSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  ...limitsSchema,
});

// ✅ Toggle status (solo params, no body)
export const toggleTenantStatusSchema = z.object({
  status: z.boolean().optional(),
});

// ✅ Query para paginación y filtros
export const getAllTenantsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9][0-9]*$/, { message: "Page must be a positive integer >= 1" })
    .optional()
    .default("1"),

  limit: z
    .string()
    .regex(/^[1-9][0-9]*$/, { message: "Limit must be a positive integer" })
    .refine((val) => parseInt(val) <= 500, {
      message: "Limit cannot exceed 500",
    })
    .optional()
    .default("10"),

  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
});