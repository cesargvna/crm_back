// src/validators/inventory.validation.ts
import { z } from "zod";

// Helpers
const uuidField = (field: string) =>
  z.string({ required_error: `${field} is required.` }).uuid(`${field} must be a valid UUID.`);

export const createInventorySchema = z.object({
  productId: uuidField("Product ID"),
  quantity_available: z
    .number({ required_error: "Quantity available is required." })
    .int("Must be an integer.")
    .min(0, "Must be at least 0."),
  min_quantity: z
    .number({ required_error: "Minimum quantity is required." })
    .int("Must be an integer.")
    .min(0, "Must be at least 0."),
  userId: uuidField("User ID"),
  tenantId: uuidField("Tenant ID"),
  subsidiaryId: uuidField("Subsidiary ID"),
});

export const updateInventorySchema = z.object({
  quantity_available: z
    .number({ required_error: "Quantity available is required." })
    .int("Must be an integer.")
    .min(0, "Must be at least 0."),
  min_quantity: z
    .number({ required_error: "Minimum quantity is required." })
    .int("Must be an integer.")
    .min(0, "Must be at least 0."),
  userId: uuidField("User ID"),
});

export const getInventoryBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});
