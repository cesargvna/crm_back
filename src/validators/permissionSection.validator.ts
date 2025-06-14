// src/validators/permissionSection.validator.ts
import { z } from "zod";

// 🔒 Regla común: solo letras, sin ñ, sin números, sin espacios
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(40, "Name must be at most 40 characters")
  .regex(
    /^[a-zA-Z.]+$/,
    'Only letters and "." are allowed. No ñ, spaces, numbers or symbols'
  );

export const createPermissionSectionSchema = z.object({
  name: nameSchema,
  order: z.number().int().min(0).optional(),
});

export const updatePermissionSectionSchema = z.object({
  name: nameSchema,
  order: z.number().int().min(0).optional(),
});

export const togglePermissionSectionStatusSchema = z.object({
  status: z.boolean().optional(), // ✅ ahora no es requerido
});

export const getAllPermissionSectionsQuerySchema = z.object({
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
    .default("5"),

  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  orderBy: z
    .enum(["name", "order", "created_at", "updated_at"])
    .optional()
    .default("order"),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),
});
