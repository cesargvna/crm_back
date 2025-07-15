import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear compra
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const { total, note, purchaseDate, paymentType, purchaseStatus, paymentStatus, supplierId, userId, tenantId, subsidiaryId, purchaseDetails } = req.body;

  const created = await prisma.purchase.create({
    data: {
      total, note, purchaseDate, paymentType, purchaseStatus, paymentStatus,
      supplierId, userId, tenantId, subsidiaryId,
      purchaseDetails: {
        create: purchaseDetails, // se espera array [{...}]
      },
    },
    include: { purchaseDetails: true },
  });

  res.status(201).json({ message: "Purchase created successfully.", purchase: created });
});

// ✅ Obtener por Subsidiary
export const getPurchasesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  const purchases = await prisma.purchase.findMany({
    where: { subsidiaryId },
    include: { purchaseDetails: true },
    orderBy: { purchaseDate: "desc" },
  });

  res.json({ total: purchases.length, purchases });
});
