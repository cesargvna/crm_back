import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear Sale
export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const {
    total,
    note,
    saleDate,
    paymentType,
    dispatchStatus,
    paymentStatus,
    clientId,
    userId,
    tenantId,
    subsidiaryId,
    saleDetails,
  } = req.body;

  const created = await prisma.sale.create({
    data: {
      total,
      note,
      saleDate,
      paymentType,
      dispatchStatus,
      paymentStatus,
      clientId,
      userId,
      tenantId,
      subsidiaryId,
      saleDetails: { create: saleDetails },
    },
    include: { saleDetails: true },
  });

  res.status(201).json({ message: "Sale created successfully.", sale: created });
});

// ✅ Obtener Sales por Subsidiary
export const getSalesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { search, page = "1", limit = "10", status } = req.query;

  const where: any = { subsidiaryId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim();
    where.OR = [
      { note: { contains: normalizedSearch, mode: "insensitive" } },
      { client: { name: { contains: normalizedSearch, mode: "insensitive" } } },
    ];
  }

  if (status) {
    where.dispatchStatus = status === "COMPLETADA" ? "COMPLETADA" : "ANULADA";
  }

  const take = Math.max(parseInt(limit as string), 1);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      skip,
      take,
      include: {
        user: { select: { id: true, username: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    }),
  ]);

  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: subsidiaryId },
    select: { id: true, name: true },
  });

  res.json({
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    subsidiary: subsidiary || null,
    sales,
  });
});

// ✅ Obtener Sales por UserId
export const getSalesByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { search, page = "1", limit = "10", status } = req.query;

  const where: any = { userId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim();
    where.OR = [
      { note: { contains: normalizedSearch, mode: "insensitive" } },
      { client: { name: { contains: normalizedSearch, mode: "insensitive" } } },
    ];
  }

  if (status) {
    where.dispatchStatus = status === "COMPLETADA" ? "COMPLETADA" : "ANULADA";
  }

  const take = Math.max(parseInt(limit as string), 1);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, sales] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      skip,
      take,
      include: {
        user: { select: { id: true, username: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true },
  });

  res.json({
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    user: user || null,
    sales,
  });
});

// ✅ Obtener Sale por ID
export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, name: true } },
      client: { select: { id: true, name: true } },
      saleDetails: {
        select: {
          id: true,
          unit_price: true,
          quantity: true,
          subtotal: true,
          product: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!sale) {
    return res.status(404).json({ message: "Sale not found." });
  }

  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: sale.subsidiaryId },
    select: { id: true, name: true },
  });

  res.json({
    ...sale,
    subsidiary: subsidiary || null,
  });
});
