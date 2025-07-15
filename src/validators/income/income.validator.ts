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
export const createIncomeSchema = z.object({
  name: nameSchema,
  description: optionalString(100),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.number().positive("Unit price must be greater than 0"),
  incomeCategoryId: uuidField("Income Category ID"),
  userId: uuidField("User ID"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// UPDATE
export const updateIncomeSchema = z.object({
  name: nameSchema.optional(),
  description: optionalString(100),
  quantity: z.number().int().min(1).optional(),
  unit_price: z.number().positive().optional(),
  incomeCategoryId: uuidField("Income Category ID").optional(),
});

// GET BY SUBSIDIARY
export const getIncomesBySubsidiarySchema = z.object({
  subsidiaryId: z.string().uuid("Invalid subsidiary ID."),
});

// GET BY ID
export const getIncomeByIdSchema = z.object({
  id: z.string().uuid("Invalid income ID."),
});
