import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";

// Crear expense
export const createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tenantId, id: userId } = req.user || {};
    if (!tenantId || !userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { name, description, total_amount, expenseCategoryId, subsidiaryId } = req.body;

    const newExpense = await prisma.expense.create({
      data: {
        id: uuidv4(),
        name,
        description,
        total_amount,
        status: true,
        tenantId,
        userId,
        expenseCategoryId,
        subsidiaryId,
      },
    });

    res.status(201).json({ success: true, message: "Expense created", data: newExpense });
  } catch (error) {
    next(error);
  }
};

// Actualizar expense
export const updateExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user || {};
    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });

    if (!expense) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({ success: true, message: "Expense updated", data: updatedExpense });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los expenses
export const getAllExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "created_at",
      sortOrder = "desc",
      status = "all",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {
      tenantId: req.user?.tenantId,
      ...(status !== "all" && { status: status === "true" }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ],
      }),
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: pageSize,
        include: { expenseCategory: true, user: true },
        orderBy: { [sortBy as string]: sortOrder === "desc" ? "desc" : "asc" },
      }),
      prisma.expense.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obtener expense por ID
export const getExpenseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findFirst({
      where: { id, tenantId: req.user?.tenantId },
      include: { expenseCategory: true, user: true },
    });

    if (!expense) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// Cambiar estado (habilitar/deshabilitar)
export const toggleExpenseStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: { id, tenantId: req.user?.tenantId },
    });

    if (!expense) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: { status: !expense.status },
    });

    res.status(200).json({ success: true, message: "Expense status updated", data: updated });
  } catch (error) {
    next(error);
  }
};
