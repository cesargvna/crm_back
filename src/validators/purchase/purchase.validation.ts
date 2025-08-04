import { z } from "zod";

// 🔧 Helpers
const uuidField = (field: string) =>
  z.string({ required_error: `${field} is required.` }).uuid(`${field} must be a valid UUID.`);

const optionalUuid = (field: string) =>
  z.string().uuid(`${field} must be a valid UUID.`).optional();

const noteSchema = z.string().trim().max(255, "Note must have max 255 characters").optional();

// ✅ Enums exactos del modelo Prisma
const paymentTypeEnum = z.enum(["CONTADO", "CREDITO"]);
const dispatchStatusEnum = z.enum(["COMPLETADA", "ANULADA"]);
const paymentStatusEnum = z.enum(["PENDIENTE", "PARCIAL", "COMPLETO"]);

// ✅ Detalles de compra
const purchaseDetailSchema = z.object({
  productId: uuidField("Product ID"),
  price: z.number({ required_error: "Price is required." }).nonnegative(),
  quantity: z.number({ required_error: "Quantity is required." }).int().positive(),
  currencyId: uuidField("Currency ID"),
});

// ✅ Crear compra (con o sin precios automáticos)
export const createPurchaseSchema = z.object({
  purchaseDate: z.string({ required_error: "Purchase date is required." }).refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Purchase date must be a valid ISO date string." }
  ),
  paymentType: paymentTypeEnum,
  paymentStatus: paymentStatusEnum,
  note: noteSchema,
  supplierId: uuidField("Supplier ID"),
  userId: uuidField("User ID"),
  tenantId: z.string({ required_error: "Tenant ID is required." }).min(1),
  subsidiaryId: uuidField("Subsidiary ID"),
  purchaseDetails: z
    .array(purchaseDetailSchema, {
      required_error: "Purchase details are required.",
    })
    .min(1, "At least one purchase detail is required."),
});