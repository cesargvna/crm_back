import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Obtener ProductPrices por Subsidiary
export const getProductPricesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { search, page = "1", limit = "10" } = req.query;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const where: any = { subsidiaryId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim().toLowerCase();
    where.OR = [
      { product: { name: { contains: normalizedSearch, mode: "insensitive" } } },
      { priceType: { name: { contains: normalizedSearch, mode: "insensitive" } } },
      { currency: { name: { contains: normalizedSearch, mode: "insensitive" } } },
    ];
  }

  const take = Math.max(parseInt(limit as string) || 10, 5);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, productPrices] = await Promise.all([
    prisma.productPrice.count({ where }),
    prisma.productPrice.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take,
      include: {
        product: { select: { id: true, name: true } },
        priceType: { select: { id: true, name: true } },
        currency: { select: { id: true, name: true, code: true } },
      },
    }),
  ]);

  res.json({
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    productPrices,
  });
});

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

// ✅ Obtener ProductPrice por ID
export const getProductPriceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const productPrice = await prisma.productPrice.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, code: true } },
      priceType: { select: { id: true, name: true } },
      currency: { select: { id: true, name: true, code: true } },
    },
  });

  if (!productPrice) {
    return res.status(404).json({ message: "ProductPrice not found." });
  }

  res.json(productPrice);
});
