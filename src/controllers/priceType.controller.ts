import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// Helper normalizar nombre
function normalizePriceTypeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .trim()
    .toLowerCase();
}

// ✅ Crear
export const createPriceType = asyncHandler(async (req: Request, res: Response) => {
  const { name, marginPercent, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizePriceTypeName(name);

  // Validar duplicado por nombre y sucursal
  const exists = await prisma.priceType.findFirst({
    where: { name: normalizedName, subsidiaryId },
  });
  if (exists) {
    return res.status(409).json({ message: "PriceType with this name already exists for this subsidiary." });
  }

  const created = await prisma.priceType.create({
    data: {
      name: normalizedName,
      marginPercent,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({ message: "PriceType created successfully.", priceType: created });
});

// ✅ Update
export const updatePriceType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, marginPercent } = req.body;

  const existing = await prisma.priceType.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "PriceType not found." });
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
        return res.status(409).json({ message: "Another PriceType with this name exists for this subsidiary." });
      }
    }
  }

  const updated = await prisma.priceType.update({
    where: { id },
    data: {
      name: normalizedName ?? undefined,
      marginPercent: marginPercent ?? undefined,
    },
  });

  res.json({ message: "PriceType updated successfully.", priceType: updated });
});

// ✅ Get by Subsidiary
export const getPriceTypesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { search, status, page = "1", limit = "5" } = req.query;

  const where: any = { subsidiaryId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim().toLowerCase();
    where.name = { contains: normalizedSearch, mode: "insensitive" };
  }

  if (status === "true") where.status = true;
  if (status === "false") where.status = false;

  const take = Math.max(parseInt(limit as string), 5);
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

// ✅ Get by ID
export const getPriceTypeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const type = await prisma.priceType.findUnique({ where: { id } });
  if (!type) return res.status(404).json({ message: "PriceType not found." });
  res.json(type);
});

// ✅ Toggle Status
export const togglePriceTypeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const type = await prisma.priceType.findUnique({ where: { id } });
  if (!type) return res.status(404).json({ message: "PriceType not found." });

  const updated = await prisma.priceType.update({
    where: { id },
    data: { status: !type.status },
  });

  res.json({
    message: `PriceType status changed to ${updated.status ? "active" : "inactive"}.`,
    priceType: updated,
  });
});

// ✅ Get active
export const getActivePriceTypesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  const activeTypes = await prisma.priceType.findMany({
    where: { subsidiaryId, status: true },
    orderBy: { name: "asc" },
  });

  res.json({ total: activeTypes.length, priceTypes: activeTypes });
});
