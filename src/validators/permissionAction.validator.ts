import { z } from 'zod';

// 🔒 Regla: solo letras, sin ñ, sin números, sin espacios
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(
    /^[a-zA-Z.]+$/,
    'Only letters and "." are allowed. No ñ, spaces, numbers or symbols'
  );

// 👉 Crear acción
export const createPermissionActionSchema = z.object({
  name: nameSchema,
});

// 👉 Actualizar acción
export const updatePermissionActionSchema = z.object({
  name: nameSchema,
});
