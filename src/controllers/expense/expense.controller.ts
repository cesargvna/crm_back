import { Request, Response } from "express";
import { Prisma } from "../../../generated/prisma"; // 👈 Importa Prisma para usar Prisma.Decimal
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ----------------- Normalizadores -----------------
export function normalizeExpenseName(value: string): string {
  return value.normalize("NFD").replace(/ñ/gi, "n").replace(/\s+/g, " ").trim();
}

export function normalizeExpenseDescription(value: string): string {
  return value.replace(/ñ/gi, "n").replace(/\s+/g, " ").trim();
}

// ----------------- CREATE EXPENSE -----------------
export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      quantity,
      unit_price,
      expenseCategoryId,
      userId,
      tenantId,
      subsidiaryId,
    } = req.body; // 🚫 No esperes total_amount del body

    // 🔒 Validar existencia y pertenencia de ExpenseCategory
    const expenseCategory = await prisma.expenseCategory.findUnique({
      where: { id: expenseCategoryId },
    });
    if (!expenseCategory) {
      return res.status(404).json({ message: "Expense category not found." });
    }
    if (
      expenseCategory.tenantId !== tenantId ||
      expenseCategory.subsidiaryId !== subsidiaryId
    ) {
      return res.status(400).json({
        message:
          "Expense category does not belong to specified tenant or subsidiary.",
      });
    }

    // 🔒 Validar existencia de User
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const normalizedName = name.trim().toLowerCase();

    // ✅ Calcula siempre total_amount
    const calculatedTotal = Number(quantity) * Number(unit_price);

    const created = await prisma.expense.create({
      data: {
        name: normalizedName,
        description: description?.trim(),
        quantity: Number(quantity),
        unit_price: Number(unit_price),
        total_amount: calculatedTotal,
        expenseCategoryId,
        userId,
        tenantId,
        subsidiaryId,
      },
    });

    res.status(201).json({
      message: "Expense created successfully.",
      expense: created,
    });
  }
);

// ----------------- UPDATE EXPENSE -----------------
export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      quantity,
      unit_price,
      expenseCategoryId,
    } = req.body; // 🚫 No recibes total_amount

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Expense not found." });
    }

    if (expenseCategoryId) {
      const expenseCategory = await prisma.expenseCategory.findUnique({
        where: { id: expenseCategoryId },
      });
      if (!expenseCategory) {
        return res.status(404).json({ message: "Expense category not found." });
      }
    }

    // ✅ Determina nuevos valores para quantity y unit_price
    const updatedQuantity = quantity ?? existing.quantity;
    const updatedUnitPrice = unit_price ?? existing.unit_price;

    const calculatedTotal = Number(updatedQuantity) * Number(updatedUnitPrice);

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        name: name?.trim().toLowerCase() ?? undefined,
        description: description?.trim() ?? undefined,
        quantity: quantity ?? undefined,
        unit_price: unit_price ?? undefined,
        total_amount: calculatedTotal, // ✅ Siempre recalculado
        expenseCategoryId: expenseCategoryId ?? undefined,
      },
    });

    res.json({
      message: "Expense updated successfully.",
      expense: updated,
    });
  }
);

// ----------------- OBTENER POR SUBSIDIARY -----------------
export const getExpensesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      expenseCategoryId,
    } = req.query;

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

    if (expenseCategoryId) {
      filters.expenseCategoryId = expenseCategoryId as string;
    }

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where: filters,
        orderBy: { name: "asc" },
        skip,
        take,
        include: {
          expenseCategory: true,
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.expense.count({ where: filters }),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
      data,
    });
  }
);

// ----------------- OBTENER POR ID -----------------
export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        expenseCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.json({
      ...expense,
      tenantId: expense.tenantId,
      subsidiaryId: expense.subsidiaryId,
    });
  }
);
