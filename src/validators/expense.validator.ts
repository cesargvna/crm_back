// ✅ expense.validator.ts
import { z } from "zod";

export const expenseSchema = z.object({
  name: z
    .string()
    .min(2, "Name must have at least 2 characters.")
    .max(50, "Name must not exceed 50 characters."),

  description: z
    .string()
    .max(100, "Description must not exceed 100 characters.")
    .optional()
    .nullable(),

  total_amount: z.coerce.number().positive("Total amount must be positive."),

  expenseCategoryId: z.string().uuid("Invalid expense category ID."),
  subsidiaryId: z.string().uuid("Invalid subsidiary ID."),

  status: z.boolean().optional(),
});

export const updateExpenseSchema = expenseSchema.partial();

export const toggleExpenseStatusSchema = z.object({
  id: z.string().uuid("Invalid expense ID."),
});

export const getAllExpensesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => parseInt(v || "1"))
    .refine((v) => v >= 1, {
      message: "Page must be at least 1",
    }),
  limit: z
    .string()
    .optional()
    .transform((v) => parseInt(v || "10"))
    .refine((v) => v >= 1 && v <= 1000, {
      message: "Limit must be between 1 and 1000",
    }),
  search: z.string().optional(),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  sortBy: z
    .enum(["created_at", "name", "total_amount"])
    .optional()
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
