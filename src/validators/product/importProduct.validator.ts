// ✅ src/validators/product/importProduct.validation.ts
import { z } from "zod";

// Schema to validate each row from the Excel file
export const importProductRowSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  productCategoryName: z.string().min(1, "Category name is required"),
  unitMeasurementName: z.string().min(1, "Unit name is required"),
  quantityUnit: z.union([
    z.string().regex(/^\d+$/, "Quantity must be a number").transform(Number),
    z.number().int().positive("Quantity must be positive"),
  ]),
  barcode: z.string().optional(),
  description: z.string().optional(),
});

// Schema to validate form-data fields
export const importExcelFormSchema = z.object({
  tenantId: z.string().uuid("Invalid tenantId"),
  subsidiaryId: z.string().uuid("Invalid subsidiaryId"),
});
