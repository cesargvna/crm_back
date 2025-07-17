import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear Purchase
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const {
    total,
    note,
    purchaseDate,
    paymentType,
    purchaseStatus,
    paymentStatus,
    supplierId,
    userId,
    tenantId,
    subsidiaryId,
    purchaseDetails
  } = req.body;

  const created = await prisma.purchase.create({
    data: {
      total,
      note,
      purchaseDate,
      paymentType,
      purchaseStatus,
      paymentStatus,
      supplierId,
      userId,
      tenantId,
      subsidiaryId,
      purchaseDetails: {
        create: purchaseDetails, // Array [{...}]
      },
    },
    include: { purchaseDetails: true },
  });

  res.status(201).json({ message: "Purchase created successfully.", purchase: created });
});

// ✅ Obtener Purchases por Subsidiary (con paginación, búsqueda, filtros)
export const getPurchasesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { search, paymentStatus, purchaseStatus, page = "1", limit = "10" } = req.query;

  const where: any = { subsidiaryId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim().toLowerCase();
    where.OR = [
      { note: { contains: normalizedSearch, mode: "insensitive" } },
      { supplier: { name: { contains: normalizedSearch, mode: "insensitive" } } },
    ];
  }

  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (purchaseStatus) where.purchaseStatus = purchaseStatus;

  const take = Math.max(parseInt(limit as string) || 10, 5);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, purchases] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: "desc" },
      skip,
      take,
      include: {
        supplier: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, username: true } },
        purchaseDetails: true,
      },
    }),
  ]);

  res.json({
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    purchases,
  });
});

// ✅ Obtener Purchases por UserId (con paginación, búsqueda, filtros)
export const getPurchasesByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { search, paymentStatus, purchaseStatus, page = "1", limit = "10" } = req.query;

  const where: any = { userId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim().toLowerCase();
    where.OR = [
      { note: { contains: normalizedSearch, mode: "insensitive" } },
      { supplier: { name: { contains: normalizedSearch, mode: "insensitive" } } },
    ];
  }

  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (purchaseStatus) where.purchaseStatus = purchaseStatus;

  const take = Math.max(parseInt(limit as string) || 10, 5);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, purchases] = await Promise.all([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({
      where,
      orderBy: { purchaseDate: "desc" },
      skip,
      take,
      include: {
        supplier: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, username: true } },
        purchaseDetails: true,
      },
    }),
  ]);

  res.json({
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    purchases,
  });
});

// ✅ Obtener Purchase por ID
export const getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Purchase ID is required." });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: {
        select: { id: true, name: true, company: true, email: true },
      },
      user: {
        select: { id: true, name: true, username: true },
      },
      purchaseDetails: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              code: true,
              barcode: true,
              productCategory: { select: { id: true, name: true } },
              unitMeasurement: { select: { id: true, name: true, quantity: true } },
            },
          },
        },
      },
      creditPayments: true,
    },
  });

  if (!purchase) {
    return res.status(404).json({ message: "Purchase not found." });
  }

  res.json(purchase);
});
