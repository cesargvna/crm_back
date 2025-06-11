import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(3, { message: "Role name must be at least 3 characters" })
  .max(40, { message: "Role name must be at most 40 characters" })
  .regex(/^[A-Za-z. ]+$/, {
    message:
      "Role name can contain only letters, spaces and periods (no ñ, numbers or special characters)",
  });

const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const createRoleSchema = z.object({
  name: nameSchema,
  description: optionalString(255),
  tenantId: z.string().uuid({ message: "Invalid tenant ID" }),
  subsidiaryId: z.string().uuid({ message: "Invalid subsidiary ID" }),
});

export const updateRoleSchema = z.object({
  name: nameSchema,
  description: optionalString(255),
});

export const getAllRolesQuerySchema = z.object({
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
    .default("10"),

  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  orderBy: z
    .enum(["name", "created_at", "updated_at"])
    .optional()
    .default("name"),
  sort: z.enum(["asc", "desc"]).optional().default("asc"),

  subsidiaryId: z
    .string()
    .uuid({ message: "Invalid subsidiary ID" })
    .optional(), // <--- nuevo
});
