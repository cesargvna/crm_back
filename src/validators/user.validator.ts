import { z } from "zod";

// ✔️ Crear usuario
export const createUserSchema = z.object({
  body: z.object({
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
      .max(50, "Name must not exceed 50 characters."),
    lastname: z.string().max(50).optional().nullable(),
    ci: z.string().max(20).optional().nullable(),
    nit: z.string().max(20).optional().nullable(),
    description: z.string().max(100).optional().nullable(),
    address: z.string().max(100).optional().nullable(),
    cellphone: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .refine(
        (val) => val === null || /^\+\d{6,20}$/.test(val),
        "Invalid cellphone format."
      )
      .optional(),
    telephone: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .refine(
        (val) => val === null || /^\+\d{6,20}$/.test(val),
        "Invalid telephone format."
      )
      .optional(),
    email: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .refine(
        (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Invalid email format."
      )
      .optional(),
    roleId: z.string().uuid("Invalid Role ID."),
    subsidiaryId: z.string().uuid("Invalid Subsidiary ID."),
  }),
});

// ✔️ Actualizar usuario
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    lastname: z.string().max(50).optional().nullable(),
    ci: z.string().max(20).optional().nullable(),
    nit: z.string().max(20).optional().nullable(),
    description: z.string().max(100).optional().nullable(),
    address: z.string().max(100).optional().nullable(),
    cellphone: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .refine(
        (val) => val === null || /^\+\d{6,20}$/.test(val),
        "Invalid cellphone format."
      )
      .optional(),
    telephone: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .refine(
        (val) => val === null || /^\+\d{6,20}$/.test(val),
        "Invalid telephone format."
      )
      .optional(),
    email: z
      .string()
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .refine(
        (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Invalid email format."
      )
      .optional(),
    roleId: z.string().uuid("Invalid Role ID."),
  }),
  params: z.object({
    id: z.string().uuid("Invalid user ID."),
  }),
});

// ✔️ Cambiar password
export const updateUserPasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .min(6, "Password must have at least 6 characters.")
      .max(100, "Password must not exceed 100 characters."),
  }),
  params: z.object({
    id: z.string().uuid("Invalid user ID."),
  }),
});

// ✔️ Cambiar estado
export const toggleUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID."),
  }),
});

// ✔️ Queries para listar
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
    .refine((v) => v >= 1 && v <= 100, {
      message: "Limit must be between 1 and 100",
    }),
  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  orderBy: z.enum(["created_at", "username", "name"]).optional(),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),
});
