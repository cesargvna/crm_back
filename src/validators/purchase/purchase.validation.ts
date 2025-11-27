import { z } from "zod";

// 🔸 Helper para aceptar string | number y convertir a número
const decimalField = z.union([
  z.string().regex(/^\d+(\.\d+)?$/, "Debe ser un número válido").transform(Number),
  z.number()
]).refine((n) => !isNaN(n), { message: "Debe ser un número válido" });

// 🔸 Enums
const paymentTypeEnum = z.enum(["CONTADO", "CREDITO"]);
const paymentStatusEnum = z.enum(["PENDIENTE", "PARCIAL", "COMPLETO"]);
const discountTypeEnum = z.enum(["PORCENTAJE", "CANTIDAD"]);

// 🔸 Validación de salePrices dentro de cada detalle
const salePriceSchema = z.object({
  priceTypeId: z.string().uuid("priceTypeId inválido"),
  price: decimalField
});

// 🔸 Validación de cada detalle
const purchaseDetailSchema = z.object({
  productId: z.string().uuid("productId inválido"),
  price: decimalField,
  quantity: z.number().int("La cantidad debe ser entera").min(0, "Cantidad no puede ser negativa"),
  currencyId: z.string().uuid("currencyId inválido"),
  salePrices: z.array(salePriceSchema).min(1, "Debe incluir al menos un precio de venta")
});

// 🔸 Validación de body completo
export const createPurchaseSchema = z.object({
  tenantId: z.string().uuid("tenantId inválido"),
  subsidiaryId: z.string().uuid("subsidiaryId inválido"),
  userId: z.string().uuid("userId inválido"),
  supplierId: z.string().uuid("supplierId inválido"),
  paymentType: paymentTypeEnum,
  paymentStatus: paymentStatusEnum,
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  note: z.string().max(255).optional(),
  cashSessionId: z.string().uuid().nullable().optional(),
  discountType: discountTypeEnum.optional().default("PORCENTAJE"),
  discountValue: decimalField.optional().default(0),
  purchaseDetails: z.array(purchaseDetailSchema).min(1, "Debe incluir al menos un detalle")
});