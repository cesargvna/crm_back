import { z } from "zod";

// 🔵 Helpers
export const uuidField = (field: string) =>
  z
    .string({ required_error: `${field} is required.` })
    .uuid(`${field} must be a valid UUID.`);

export const decimalField = (field: string) =>
  z
    .string({
      required_error: `${field} is required.`,
      invalid_type_error: `${field} must be a decimal number.`,
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: `${field} must be greater than 0.`,
    });

// ✅ CREATE
export const createExchangeRateSchema = z.object({
  fromCurrencyId: uuidField("From Currency ID"),
  toCurrencyId: uuidField("To Currency ID"),
  rate: decimalField("Rate"),
  tenantId: z.string().min(1, "Tenant ID is required."),
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ UPDATE
export const updateExchangeRateSchema = z.object({
  rate: decimalField("Rate"),
});

// ✅ GET BY SUBSIDIARY
export const getExchangeRatesBySubsidiarySchema = z.object({
  subsidiaryId: uuidField("Subsidiary ID"),
});

// ✅ GET BY ID
export const getExchangeRateByIdSchema = z.object({
  id: uuidField("ExchangeRate ID"),
});
