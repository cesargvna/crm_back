import { z } from "zod";

// Helpers
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name must be at least 1 character")
  .max(100, "Name must be at most 100 characters.");

export const optionalString = (max: number) =>
  z.string().max(max).optional().or(z.literal(""));

export const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .uuid(`${field} must be a valid UUID`);

// CREATE
export const createExpenseSchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .int()
    .min(1, "Quantity must be at least 1"),
  unit_price: z
    .number({
      required_error: "Unit price is required",
      invalid_type_error: "Unit price must be a number",
    })
    .positive("Unit price must be greater than 0"),
  // ❌ total_amount eliminado
  expenseCategoryId: uuidField("Expense Category ID"),
  userId: uuidField("User ID"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// UPDATE
export const updateExpenseSchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
  quantity: z.number().int().min(1).optional(),
  unit_price: z.number().positive().optional(),
  // ❌ total_amount eliminado
  expenseCategoryId: uuidField("Expense Category ID").optional(),
});
// GET BY SUBSIDIARY
export const getExpensesBySubsidiarySchema = z.object({
  subsidiaryId: z.string().uuid("Invalid subsidiary ID."),
});

// GET BY ID
export const getExpenseByIdSchema = z.object({
  id: z.string().uuid("Invalid expense ID."),
});
