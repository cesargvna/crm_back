import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Obtener SaleDetails por SaleId
export const getSaleDetailsBySaleId = asyncHandler(
  async (req: Request, res: Response) => {
    const { saleId } = req.params;

    if (!saleId) {
      return res.status(400).json({ message: "saleId is required." });
    }

    const saleDetails = await prisma.saleDetail.findMany({
      where: { saleId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            barcode: true,
            status: true,
            productCategory: {
              select: { id: true, name: true }
            },
            unitMeasurement: {
              select: { id: true, name: true, quantity: true }
            },
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    if (saleDetails.length === 0) {
      return res.status(404).json({
        message: "No SaleDetails found for the specified Sale ID.",
      });
    }

    res.json({
      total: saleDetails.length,
      saleDetails,
    });
  }
);
