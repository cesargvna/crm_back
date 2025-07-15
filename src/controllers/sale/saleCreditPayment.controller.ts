import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear
export const createCreditPayment = asyncHandler(async (req: Request, res: Response) => {
  const { saleId, amount, paymentDate, tenantId, subsidiaryId } = req.body;

  const created = await prisma.saleCreditPayment.create({
    data: { saleId, amount, paymentDate, tenantId, subsidiaryId },
  });

  res.status(201).json({ message: "CreditPayment created successfully.", creditPayment: created });
});

// ✅ Obtener por Sale ID
export const getCreditPaymentsBySale = asyncHandler(async (req: Request, res: Response) => {
  const { saleId } = req.params;

  const payments = await prisma.saleCreditPayment.findMany({
    where: { saleId },
    orderBy: { paymentDate: "asc" },
  });

  res.json({ total: payments.length, payments });
});
