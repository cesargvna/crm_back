// src/validations/sale.validation.ts
import { z } from "zod";

// ✅ Helpers reutilizables
const uuidField = (field: string) =>
  z.string({ required_error: `${field} is required.` }).uuid(`${field} must be a valid UUID.`);

const noteSchema = z
  .string()
  .trim()
  .max(255, "Note must have max 255 characters")
  .optional();

// ✅ Enums del modelo Prisma
const paymentTypeEnum = z.enum(["CONTADO", "CREDITO"]);
const paymentStatusEnum = z.enum(["PENDIENTE", "PARCIAL", "COMPLETO"]);
const discountTypeEnum = z.enum(["PORCENTAJE", "CANTIDAD"]);

// ✅ Detalles de venta
const saleDetailSchema = z.object({
  productId: uuidField("Product ID"),
  price: z.number({ required_error: "Price is required." }).nonnegative(),
  quantity: z.number({ required_error: "Quantity is required." }).int().positive(),
  currencyId: uuidField("Currency ID"),
  priceTypeId: z.string().uuid().optional(),
  manualPrice: z.boolean().optional(),
});

// ✅ Crear venta (con o sin stock negativo)
export const createSaleSchema = z.object({
  saleDate: z
    .string({ required_error: "Sale date is required." })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Sale date must be a valid ISO date string.",
    }),
  paymentType: paymentTypeEnum,
  paymentStatus: paymentStatusEnum,
  note: noteSchema,
  clientId: uuidField("Client ID"),
  userId: uuidField("User ID"),
  tenantId: z.string({ required_error: "Tenant ID is required." }).min(1),
  subsidiaryId: uuidField("Subsidiary ID"),
  discountType: discountTypeEnum.optional(),
  discountValue: z
    .number({ required_error: "Discount value is required." })
    .min(0, "Discount must be zero or greater.")
    .optional(),
  saleDetails: z
    .array(saleDetailSchema, {
      required_error: "Sale details are required.",
    })
    .min(1, "At least one sale detail is required."),
});
