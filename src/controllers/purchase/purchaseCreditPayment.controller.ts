import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear PurchaseCreditPayment
export const createPurchaseCreditPayment = asyncHandler(async (req: Request, res: Response) => {
  const { purchaseId, amount, paymentDate, tenantId, subsidiaryId } = req.body;

  const created = await prisma.purchaseCreditPayment.create({
    data: { purchaseId, amount, paymentDate, tenantId, subsidiaryId },
  });

  res.status(201).json({ message: "PurchaseCreditPayment created successfully.", payment: created });
});

// ✅ Obtener por Purchase ID
export const getPurchaseCreditPaymentsByPurchase = asyncHandler(async (req: Request, res: Response) => {
  const { purchaseId } = req.params;

  const payments = await prisma.purchaseCreditPayment.findMany({
    where: { purchaseId },
    orderBy: { paymentDate: "asc" },
  });

  res.json({ total: payments.length, payments });
});
