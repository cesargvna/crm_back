import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear Sale
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const { total, note, saleDate, paymentType, dispatchStatus, paymentStatus, clientId, userId, tenantId, subsidiaryId, saleDetails } = req.body;

  const created = await prisma.sale.create({
    data: {
      total, note, saleDate, paymentType, dispatchStatus, paymentStatus,
      clientId, userId, tenantId, subsidiaryId,
      saleDetails: { create: saleDetails },
    },
    include: { saleDetails: true },
  });

  res.status(201).json({ message: "Sale created successfully.", sale: created });
});

// ✅ Obtener por Subsidiary
export const getSalesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  const sales = await prisma.sale.findMany({
    where: { subsidiaryId },
    include: { saleDetails: true },
    orderBy: { saleDate: "desc" },
  });

  res.json({ total: sales.length, sales });
});
