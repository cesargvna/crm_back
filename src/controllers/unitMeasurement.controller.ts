// src/controllers/unitMeasurement.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helper de normalización
export function normalizeUnitMeasurementName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ✅ Crear UnitMeasurement
export const createUnitMeasurement = asyncHandler(async (req: Request, res: Response) => {
  const { name, quantity, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizeUnitMeasurementName(name);

  // ✅ Validar duplicado por nombre y sucursal
  const exists = await prisma.unitMeasurement.findFirst({
    where: {
      name: normalizedName,
      subsidiaryId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "A unit measurement with this name already exists for this subsidiary.",
    });
  }

  const created = await prisma.unitMeasurement.create({
    data: {
      name: normalizedName,
      quantity,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Unit measurement created successfully.",
    unitMeasurement: created,
  });
});

// ✅ Actualizar UnitMeasurement
export const updateUnitMeasurement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity } = req.body;

  const existing = await prisma.unitMeasurement.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Unit measurement not found." });
  }

  let normalizedName: string | undefined = undefined;

  if (name) {
    normalizedName = normalizeUnitMeasurementName(name);

    if (normalizedName !== existing.name) {
      const duplicate = await prisma.unitMeasurement.findFirst({
        where: {
          id: { not: id },
          name: normalizedName,
          subsidiaryId: existing.subsidiaryId,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another unit measurement with this name already exists for this subsidiary.",
        });
      }
    }
  }

  const updated = await prisma.unitMeasurement.update({
    where: { id },
    data: {
      name: normalizedName ?? undefined,
      quantity: quantity ?? undefined,
    },
  });

  res.json({
    message: "Unit measurement updated successfully.",
    unitMeasurement: updated,
  });
});

// ✅ Obtener UnitMeasurements por Subsidiary
export const getUnitMeasurementsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
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

    const [total, units] = await Promise.all([
      prisma.unitMeasurement.count({ where }),
      prisma.unitMeasurement.findMany({
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
      units,
    });
  }
);

// ✅ Obtener UnitMeasurement por ID
export const getUnitMeasurementById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const unit = await prisma.unitMeasurement.findUnique({ where: { id } });

  if (!unit) {
    return res.status(404).json({ message: "Unit measurement not found." });
  }

  res.json(unit);
});

// ✅ Toggle UnitMeasurement status
export const toggleUnitMeasurementStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const unit = await prisma.unitMeasurement.findUnique({ where: { id } });

  if (!unit) {
    return res.status(404).json({ message: "Unit measurement not found." });
  }

  const updated = await prisma.unitMeasurement.update({
    where: { id },
    data: { status: !unit.status },
  });

  res.json({
    message: `Unit measurement status changed to ${
      updated.status ? "active" : "inactive"
    }.`,
    unitMeasurement: updated,
  });
});

// ✅ Obtener solo UnitMeasurements activos por Subsidiary
export const getActiveUnitMeasurementsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeUnits = await prisma.unitMeasurement.findMany({
      where: { subsidiaryId, status: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        quantity: true,
      },
    });

    res.json({
      total: activeUnits.length,
      units: activeUnits,
    });
  }
);
