import { z } from "zod";

const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(
    /^[A-Za-z\u00C0-\u017F\sñÑ.-]+$/,
    'Only letters, spaces, ".", and "-" are allowed'
  );

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const createSubsidiarySchema = z.object({
  name: nameSchema,
  tenantId: z.string().uuid({ message: "Invalid tenant ID" }),
  subsidiary_type: z.enum(["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"]),
  allowNegativeStock: z.boolean().optional(),

  maxUsers: z.coerce.number().min(1, "maxUsers must be a positive number").optional(),
  maxRoles: z.coerce.number().min(1, "maxRoles must be a positive number").optional(),

  ci: optionalString(20),
  nit: optionalString(20),
  description: optionalString(100),
  address: optionalString(100),
  city: optionalString(20),
  country: optionalString(20),
  cellphone: optionalString(20),
  telephone: optionalString(20),
  email: optionalString(50).refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    {
      message: "Invalid email format",
    }
  ),
});

export const updateSubsidiarySchema = z.object({
  name: nameSchema,
  subsidiary_type: z.enum(["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"]),
  allowNegativeStock: z.boolean().optional(),

  maxUsers: z.coerce.number().min(1, "maxUsers must be a positive number"),
  maxRoles: z.coerce.number().min(1, "maxRoles must be a positive number"),

  ci: optionalString(20),
  nit: optionalString(20),
  description: optionalString(100),
  address: optionalString(100),
  city: optionalString(20),
  country: optionalString(20),
  cellphone: optionalString(20),
  telephone: optionalString(20),
  email: optionalString(50).refine(
    (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    {
      message: "Invalid email format",
    }
  ),
});

export const toggleSubsidiaryStatusSchema = z.object({
  status: z.boolean().optional(),
});

export const getAllSubsidiariesQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9][0-9]*$/, { message: "Page must be a positive integer >= 1" })
    .optional()
    .default("1"),

  limit: z
    .string()
    .regex(/^[1-9][0-9]*$/, { message: "Limit must be a positive integer" })
    .refine((val) => parseInt(val) <= 1000, {
      message: "Limit cannot exceed 1000",
    })
    .optional()
    .default("5"),

  search: z.string().optional(),

  status: z.enum(["true", "false", "all"]).optional().default("all"),

  orderBy: z
    .enum(["name", "created_at", "updated_at"])
    .optional()
    .default("name"),

  sort: z.enum(["asc", "desc"]).optional().default("asc"),

  type: z
    .enum(["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA", "all"])
    .optional()
    .default("all"),
});
