import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Obtener detalles por Purchase ID
export const getPurchaseDetailsByPurchase = asyncHandler(async (req: Request, res: Response) => {
  const { purchaseId } = req.params;

  const details = await prisma.purchaseDetail.findMany({
    where: { purchaseId },
    orderBy: { created_at: "asc" },
  });

  res.json({ total: details.length, details });
});
