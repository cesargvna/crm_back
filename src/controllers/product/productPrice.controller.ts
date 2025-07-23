import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Obtener ProductPrices por productId
export const getProductPricesByProductId = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "productId is required." });
    }

    const prices = await prisma.productPrice.findMany({
      where: { productId },
      orderBy: { created_at: "desc" },
      include: {
        priceType: {
          select: { id: true, name: true, marginPercent: true },
        },
        currency: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    res.json({
      total: prices.length,
      prices,
    });
  }
);

