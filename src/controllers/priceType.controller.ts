// src/controllers/priceType.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helper de normalización
export function normalizePriceTypeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ✅ Crear PriceType
export const createPriceType = asyncHandler(async (req: Request, res: Response) => {
  const { name, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizePriceTypeName(name);

  // Validar duplicado por nombre y sucursal
  const exists = await prisma.priceType.findFirst({
    where: {
      name: normalizedName,
      subsidiaryId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "A price type with this name already exists for this subsidiary.",
    });
  }

  const created = await prisma.priceType.create({
    data: {
      name: normalizedName,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Price type created successfully.",
    priceType: created,
  });
});

// ✅ Actualizar PriceType
export const updatePriceType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const existing = await prisma.priceType.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Price type not found." });
  }

  let normalizedName: string | undefined = undefined;

  if (name) {
    normalizedName = normalizePriceTypeName(name);

    if (normalizedName !== existing.name) {
      const duplicate = await prisma.priceType.findFirst({
        where: {
          id: { not: id },
          name: normalizedName,
          subsidiaryId: existing.subsidiaryId,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another price type with this name already exists for this subsidiary.",
        });
      }
    }
  }

  const updated = await prisma.priceType.update({
    where: { id },
    data: {
      name: normalizedName ?? undefined,
    },
  });

  res.json({
    message: "Price type updated successfully.",
    priceType: updated,
  });
});

// ✅ Obtener PriceTypes por Subsidiary
export const getPriceTypesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { search, status, page = "1", limit = "5" } = req.query;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const where: any = { subsidiaryId: subsidiaryId as string };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim().toLowerCase();
    where.name = { contains: normalizedSearch, mode: "insensitive" };
  }

  if (status === "true") {
    where.status = true;
  } else if (status === "false") {
    where.status = false;
  }

  const take = Math.max(parseInt(limit as string) || 5, 5);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, priceTypes] = await Promise.all([
    prisma.priceType.count({ where }),
    prisma.priceType.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
  ]);

  res.json({
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    priceTypes,
  });
});

// ✅ Obtener PriceType por ID
export const getPriceTypeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const priceType = await prisma.priceType.findUnique({ where: { id } });

  if (!priceType) {
    return res.status(404).json({ message: "Price type not found." });
  }

  res.json(priceType);
});

// ✅ Toggle PriceType status
export const togglePriceTypeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const priceType = await prisma.priceType.findUnique({ where: { id } });

  if (!priceType) {
    return res.status(404).json({ message: "Price type not found." });
  }

  const updated = await prisma.priceType.update({
    where: { id },
    data: { status: !priceType.status },
  });

  res.json({
    message: `Price type status changed to ${updated.status ? "active" : "inactive"}.`,
    priceType: updated,
  });
});

// ✅ Obtener solo PriceTypes activos por Subsidiary
export const getActivePriceTypesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const activePriceTypes = await prisma.priceType.findMany({
    where: { subsidiaryId, status: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  res.json({
    total: activePriceTypes.length,
    priceTypes: activePriceTypes,
  });
});
