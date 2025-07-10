// src/controllers/income.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ----------------- Normalizadores -----------------
export function normalizeIncomeName(value: string): string {
  return value.normalize("NFD").replace(/ñ/gi, "n").replace(/\s+/g, " ").trim().toLowerCase();
}

export function normalizeIncomeDescription(value: string): string {
  return value.replace(/ñ/gi, "n").replace(/\s+/g, " ").trim();
}

// ----------------- CREATE INCOME -----------------
export const createIncome = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    quantity,
    unit_price,
    incomeCategoryId,
    userId,
    tenantId,
    subsidiaryId,
  } = req.body;

  // 🔒 Validar IncomeCategory
  const incomeCategory = await prisma.incomeCategory.findUnique({
    where: { id: incomeCategoryId },
  });
  if (!incomeCategory) {
    return res.status(404).json({ message: "Income category not found." });
  }
  if (
    incomeCategory.tenantId !== tenantId ||
    incomeCategory.subsidiaryId !== subsidiaryId
  ) {
    return res.status(400).json({
      message: "Income category does not belong to specified tenant or subsidiary.",
    });
  }

  // 🔒 Validar User
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const normalizedName = normalizeIncomeName(name);
  const normalizedDescription = description ? normalizeIncomeDescription(description) : null;

  const calculatedTotal = Number(quantity) * Number(unit_price);

  const created = await prisma.income.create({
    data: {
      name: normalizedName,
      description: normalizedDescription,
      quantity: Number(quantity),
      unit_price: Number(unit_price),
      total_amount: calculatedTotal,
      incomeCategoryId,
      userId,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Income created successfully.",
    income: created,
  });
});

// ----------------- UPDATE INCOME -----------------
export const updateIncome = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, quantity, unit_price, incomeCategoryId } = req.body;

  const existing = await prisma.income.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Income not found." });
  }

  if (incomeCategoryId) {
    const incomeCategory = await prisma.incomeCategory.findUnique({
      where: { id: incomeCategoryId },
    });
    if (!incomeCategory) {
      return res.status(404).json({ message: "Income category not found." });
    }
  }

  const updatedQuantity = quantity ?? existing.quantity;
  const updatedUnitPrice = unit_price ?? existing.unit_price;

  const calculatedTotal = Number(updatedQuantity) * Number(updatedUnitPrice);

  const updated = await prisma.income.update({
    where: { id },
    data: {
      name: name ? normalizeIncomeName(name) : undefined,
      description: description ? normalizeIncomeDescription(description) : undefined,
      quantity: quantity ?? undefined,
      unit_price: unit_price ?? undefined,
      total_amount: calculatedTotal,
      incomeCategoryId: incomeCategoryId ?? undefined,
    },
  });

  res.json({
    message: "Income updated successfully.",
    income: updated,
  });
});

// ----------------- GET INCOMES BY SUBSIDIARY -----------------
export const getIncomesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { page = "1", limit = "5", search = "", incomeCategoryId } = req.query;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const take = Math.min(parseInt(limit as string), 1000);
  const skip = (parseInt(page as string) - 1) * take;

  const filters: any = { subsidiaryId };

  if (search) {
    filters.OR = [
      {
        name: {
          contains: search.toString().trim().toLowerCase(),
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search.toString().trim().toLowerCase(),
          mode: "insensitive",
        },
      },
    ];
  }

  if (incomeCategoryId) {
    filters.incomeCategoryId = incomeCategoryId as string;
  }

  const [data, total] = await Promise.all([
    prisma.income.findMany({
      where: filters,
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        incomecategory: true,
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.income.count({ where: filters }),
  ]);

  res.json({
    total,
    page: Number(page),
    limit: take,
    totalPages: Math.ceil(total / take),
    data,
  });
});

// ----------------- GET INCOME BY ID -----------------
export const getIncomeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const income = await prisma.income.findUnique({
    where: { id },
    include: {
      incomecategory: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, name: true, username: true, email: true },
      },
    },
  });

  if (!income) {
    return res.status(404).json({ message: "Income not found." });
  }

  res.json({
    ...income,
    tenantId: income.tenantId,
    subsidiaryId: income.subsidiaryId,
  });
});
