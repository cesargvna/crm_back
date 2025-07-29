import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

export const getPricesByProduct = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { priceTypeId, search, page = "1", limit = "5" } = req.query;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      productCategory: { select: { name: true } },
      unitMeasurement: { select: { name: true } },
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  const where: any = { productId };

  let filteredPriceTypeIds: string[] = [];

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")
      .trim()
      .toLowerCase();

    const matchingTypes = await prisma.priceType.findMany({
      where: {
        name: { contains: normalizedSearch, mode: "insensitive" },
        subsidiaryId: product.subsidiaryId,
      },
      select: { id: true },
    });

    filteredPriceTypeIds = matchingTypes.map((pt) => pt.id);

    where.OR = [
      ...(filteredPriceTypeIds.length > 0
        ? [{ priceTypeId: { in: filteredPriceTypeIds } }]
        : []),
      ...(Number(search)
        ? [{ price: new prisma.Prisma.Decimal(search as string) }]
        : []),
    ];
  }

  if (priceTypeId) {
    where.priceTypeId = String(priceTypeId);
  }

  const take = Math.max(Number(limit) || 5, 5);
  const skip = (Number(page) - 1) * take;

  const [total, prices] = await Promise.all([
    prisma.productPrice.count({ where }),
    prisma.productPrice.findMany({
      where,
      skip,
      take,
      include: {
        priceType: {
          select: {
            id: true,
            name: true,
            currency: { select: { code: true, name: true } },
          },
        },
      },
      orderBy: { priceType: { name: "asc" } },
    }),
  ]);

  res.json({
    product: {
      id: product.id,
      name: product.name,
      code: product.code,
      barcode: product.barcode,
      productCategory: product.productCategory,
      unitMeasurement: product.unitMeasurement,
    },
    total,
    page: Number(page),
    limit: take,
    totalPages: Math.ceil(total / take),
    prices,
  });
});