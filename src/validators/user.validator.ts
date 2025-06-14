// src/validators/user.validator.ts
import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must have at least 3 characters.")
    .max(20, "Username must not exceed 20 characters.")
    .regex(
      /^[a-z0-9.]+$/,
      "Username can only contain lowercase letters, numbers and a dot."
    ),

  password: z
    .string()
    .min(6, "Password must have at least 6 characters.")
    .max(100, "Password must not exceed 100 characters."),

  name: z
    .string()
    .min(2, "Name must have at least 2 characters.")
    .max(20, "Name must not exceed 20 characters."),

  lastname: z
    .string()
    .max(20, "Last name must not exceed 20 characters.")
    .optional()
    .nullable(),

  ci: z
    .string()
    .max(20, "CI must not exceed 20 characters.")
    .optional()
    .nullable(),

  nit: z
    .string()
    .max(20, "NIT must not exceed 20 characters.")
    .optional()
    .nullable(),

  description: z
    .string()
    .max(100, "Description must not exceed 100 characters.")
    .optional()
    .nullable(),

  address: z
    .string()
    .max(100, "Address must not exceed 100 characters.")
    .optional()
    .nullable(),

  cellphone: z
    .string()
    .max(20, "Cellphone must not exceed 20 characters.")
    .regex(/^[+\d][\d\s]*$/, "Invalid cellphone format.")
    .optional()
    .nullable(),

  telephone: z
    .string()
    .max(20, "Telephone must not exceed 20 characters.")
    .regex(/^[+\d][\d\s]*$/, "Invalid telephone format.")
    .optional()
    .nullable(),

  email: z
    .string()
    .email("Invalid email format.")
    .max(20, "Email must not exceed 20 characters.")
    .optional()
    .nullable(),

  status: z.boolean().optional(),

  roleId: z.string().uuid("Invalid Role ID"),
  subsidiaryId: z.string().uuid("Invalid Subsidiary ID"),
});

export const toggleUserStatusSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export const getAllUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => parseInt(v || "1"))
    .refine((v) => v >= 1, { message: "Page must be at least 1" }),

  limit: z
    .string()
    .optional()
    .transform((v) => parseInt(v || "10"))
    .refine((v) => v >= 1 && v <= 1000, {
      message: "Limit must be between 1 and 1000",
    }),

  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  orderBy: z
    .enum(["created_at", "username", "name"])
    .optional()
    .default("name"),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const updateUserPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password must have at least 6 characters.")
    .max(100, "Password must not exceed 100 characters."),
});

export const getUserByIdParamsSchema = z.object({
  id: z.string().uuid("Invalid user ID"),
});

export const createUserParamsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must have at least 3 characters.")
    .max(20, "Username must not exceed 20 characters.")
    .regex(
      /^[a-z0-9.]+$/,
      "Username can only contain lowercase letters, numbers and a dot."
    ),
});
