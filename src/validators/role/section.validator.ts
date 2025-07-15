import { z } from "zod";

// 🔒 Regla: solo letras, sin ñ, sin espacios, sin puntos, sin números
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(40, "Name must be at most 40 characters")
  .regex(
    /^[a-zA-Z]+$/,
    "Only letters are allowed. No ñ, spaces, points, numbers or symbols."
  );

export const createSectionSchema = z.object({
  name: nameSchema,
  order: z.number().int().min(0).optional(),
});

export const updateSectionSchema = z.object({
  name: nameSchema,
  order: z.number().int().min(0).optional(),
});


export const toggleSectionVisibilitySchema = z.object({
  visibility: z.boolean().optional(),
});

export const roleIdParamSchema = z.object({
  roleId: z.string().uuid("roleId must be a valid UUID"),
});