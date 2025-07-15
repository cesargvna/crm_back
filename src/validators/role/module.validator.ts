import { z } from "zod";

// ✔️ Usamos la misma normalización: solo letras, no puntos.
const nameSchema = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(40, "Name must be at most 40 characters")
  .regex(
    /^[a-zA-Z]+$/, // Solo letras, nada más.
    'Only letters are allowed. No ñ, spaces, numbers or symbols.'
  );

const routeSchema = z
  .string()
  .min(1, "Route is required")
  .max(255, "Route must be at most 255 characters");

const iconNameSchema = z
  .string()
  .min(1, "Icon name is required")
  .max(100, "Icon name must be at most 100 characters");

export const createModuleSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  iconName: iconNameSchema,
  sectionId: z
    .string({ required_error: "Section ID is required" })
    .uuid("Invalid section ID"),
});

export const updateModuleSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  iconName: iconNameSchema,
  sectionId: z
    .string({ required_error: "Section ID is required" })
    .uuid("Invalid section ID"),
});
