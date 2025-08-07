// src/validators/submodule.validator.ts
import { z } from "zod";

const nameSchema = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-zA-Z]+$/, 'Only letters are allowed. No ñ, spaces, numbers or symbols.');

const routeSchema = z
  .string()
  .min(1)
  .max(255);

export const createSubmoduleSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  moduleId: z.string().uuid(),
});

export const updateSubmoduleSchema = z.object({
  name: nameSchema,
  route: routeSchema,
  moduleId: z.string().uuid(),
});
