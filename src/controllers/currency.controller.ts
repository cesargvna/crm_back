import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeCurrencyName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeCurrencyCode(value: string): string {
  return value.trim().toUpperCase();
}

// ✅ Crear Currency
export const createCurrency = asyncHandler(async (req: Request, res: Response) => {
  const { name, code, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizeCurrencyName(name);
  const normalizedCode = normalizeCurrencyCode(code);

  const exists = await prisma.currency.findFirst({
    where: {
      name: normalizedName,
      code: normalizedCode,
      subsidiaryId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "A currency with this name and code already exists for this subsidiary.",
    });
  }

  const created = await prisma.currency.create({
    data: {
      name: normalizedName,
      code: normalizedCode,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Currency created successfully.",
    currency: created,
  });
});

// ✅ Actualizar Currency
export const updateCurrency = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code } = req.body;

  const existing = await prisma.currency.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Currency not found." });
  }

  let normalizedName: string | undefined = undefined;
  let normalizedCode: string | undefined = undefined;

  if (name) {
    normalizedName = normalizeCurrencyName(name);
  }

  if (code) {
    normalizedCode = normalizeCurrencyCode(code);
  }

  if (normalizedName || normalizedCode) {
    const duplicate = await prisma.currency.findFirst({
      where: {
        id: { not: id },
        name: normalizedName ?? existing.name,
        code: normalizedCode ?? existing.code,
        subsidiaryId: existing.subsidiaryId,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another currency with this name and code already exists for this subsidiary.",
      });
    }
  }

  const updated = await prisma.currency.update({
    where: { id },
    data: {
      name: normalizedName ?? undefined,
      code: normalizedCode ?? undefined,
    },
  });

  res.json({
    message: "Currency updated successfully.",
    currency: updated,
  });
});

// ✅ Obtener Currencies por Subsidiary
export const getCurrenciesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { search, status, page = "1", limit = "5" } = req.query;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const where: any = { subsidiaryId };

  if (search && String(search).trim().length >= 2) {
    const normalizedSearch = String(search).trim().toLowerCase();
    where.OR = [
      { name: { contains: normalizedSearch, mode: "insensitive" } },
      { code: { contains: normalizedSearch, mode: "insensitive" } },
    ];
  }

  if (status === "true") {
    where.status = true;
  } else if (status === "false") {
    where.status = false;
  }

  const take = Math.max(parseInt(limit as string) || 5, 5);
  const skip = (parseInt(page as string) - 1) * take;

  const [total, currencies] = await Promise.all([
    prisma.currency.count({ where }),
    prisma.currency.findMany({
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
    currencies,
  });
});

// ✅ Obtener Currency por ID
export const getCurrencyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const currency = await prisma.currency.findUnique({ where: { id } });

  if (!currency) {
    return res.status(404).json({ message: "Currency not found." });
  }

  res.json(currency);
});

// ✅ Toggle status Currency
export const toggleCurrencyStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const currency = await prisma.currency.findUnique({ where: { id } });

  if (!currency) {
    return res.status(404).json({ message: "Currency not found." });
  }

  const updated = await prisma.currency.update({
    where: { id },
    data: { status: !currency.status },
  });

  res.json({
    message: `Currency status changed to ${updated.status ? "active" : "inactive"}.`,
    currency: updated,
  });
});

// ✅ Obtener solo Currencies activos por Subsidiary
export const getActiveCurrenciesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const activeCurrencies = await prisma.currency.findMany({
    where: { subsidiaryId, status: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  res.json({
    total: activeCurrencies.length,
    currencies: activeCurrencies,
  });
});
