import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear ExchangeRate
export const createExchangeRate = asyncHandler(async (req: Request, res: Response) => {
  const { fromCurrencyId, toCurrencyId, rate, tenantId, subsidiaryId } = req.body;

  // Verificar existencia de monedas
  const fromCurrency = await prisma.currency.findUnique({ where: { id: fromCurrencyId } });
  const toCurrency = await prisma.currency.findUnique({ where: { id: toCurrencyId } });

  if (!fromCurrency || !toCurrency) {
    return res.status(404).json({ message: "Una o ambas monedas no existen." });
  }

  // Verificar duplicado (misma combinación origen-destino en la misma sucursal)
  const exists = await prisma.exchangeRate.findFirst({
    where: { fromCurrencyId, toCurrencyId, subsidiaryId },
  });

  if (exists) {
    return res.status(409).json({
      message: "Ya existe una tasa de cambio para este par de monedas en esta sucursal.",
    });
  }

  const created = await prisma.exchangeRate.create({
    data: {
      fromCurrencyId,
      toCurrencyId,
      rate,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Tasa de cambio creada correctamente.",
    exchangeRate: created,
  });
});

// ✅ Actualizar ExchangeRate
export const updateExchangeRate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rate } = req.body;

  const existing = await prisma.exchangeRate.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Tasa de cambio no encontrada." });
  }

  const updated = await prisma.exchangeRate.update({
    where: { id },
    data: { rate },
  });

  res.json({
    message: "Tasa de cambio actualizada correctamente.",
    exchangeRate: updated,
  });
});

// ✅ Obtener todas por Subsidiary
export const getExchangeRatesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId es requerido." });
  }

  const rates = await prisma.exchangeRate.findMany({
    where: { subsidiaryId },
    include: {
      fromCurrency: { select: { id: true, code: true, name: true } },
      toCurrency: { select: { id: true, code: true, name: true } },
    },
    orderBy: { created_at: "desc" },
  });

  res.json({
    total: rates.length,
    exchangeRates: rates,
  });
});

// ✅ Obtener por ID
export const getExchangeRateById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const rate = await prisma.exchangeRate.findUnique({
    where: { id },
    include: {
      fromCurrency: { select: { id: true, code: true, name: true } },
      toCurrency: { select: { id: true, code: true, name: true } },
    },
  });

  if (!rate) {
    return res.status(404).json({ message: "Tasa de cambio no encontrada." });
  }

  res.json(rate);
});
