import { z } from "zod";
import { PaymentType, PaymentStatus, PurchaseStatus } from "../../../generated/prisma";

export const createPurchaseSchema = z.object({
  total: z.number(),
  note: z.string().optional(),
  paymentType: z.nativeEnum(PaymentType),
  purchaseStatus: z.nativeEnum(PurchaseStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  supplierId: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  subsidiaryId: z.string().uuid(),
  purchaseDetails: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
      unit_price: z.number().min(0),
      sub_total: z.number().min(0),
    })
  ),
});

export const getPurchaseByIdSchema = z.object({
  id: z.string().uuid("Invalid purchase ID"),
});

export const getPurchasesBySubsidiarySchema = z.object({
  params: z.object({
    subsidiaryId: z.string().uuid("Invalid Subsidiary ID"),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["CONFIRMADA", "DEVUELTA"]).optional(),
    paymentStatus: z.enum(["PENDIENTE", "PARCIAL", "COMPLETO"]).optional(),
    paymentType: z.enum(["CONTADO", "CREDITO"]).optional(),
    supplierId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    startDate: z.string().optional(), // podría ser .datetime() si los formatos están bien
    endDate: z.string().optional(),
    search: z.string().optional(),
  }),
});