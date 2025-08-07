import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

export function normalizeExpenseCategoryName(value: string): string {
  return value
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/ñ/g, "n") // reemplaza ñ
    .replace(/\s+/g, " ") // espacios múltiples → uno
    .trim() // sin espacios adelante/atrás
    .toLowerCase(); // minúsculas consistentes
}

export function normalizeExpenseCategoryDescription(value: string): string {
  return value
    .replace(/ñ/gi, "n") // reemplaza ñ por n
    .replace(/\s+/g, " ") // espacios múltiples → uno
    .trim(); // sin espacios adelante/atrás
}

// ✅ Crear ExpenseCategory
export const createExpenseCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, tenantId, subsidiaryId } = req.body;

    const normalizedName = normalizeExpenseCategoryName(name);
    const normalizedDescription = description
      ? normalizeExpenseCategoryDescription(description)
      : null;

    // 1️⃣ Verificar que la Subsidiary exista y pertenezca al Tenant
    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id: subsidiaryId },
    });

    if (!subsidiary) {
      return res.status(404).json({
        message: "Subsidiary not found.",
      });
    }

    if (subsidiary.tenantId !== tenantId) {
      return res.status(400).json({
        message: "The Subsidiary does not belong to the specified Tenant.",
      });
    }

    // 2️⃣ Verificar unicidad de la ExpenseCategory dentro del Tenant + Subsidiary
    const exists = await prisma.expenseCategory.findFirst({
      where: {
        name: normalizedName,
        tenantId,
        subsidiaryId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message:
          "An expense category with this name already exists for this tenant and subsidiary.",
      });
    }

    // 3️⃣ Crear
    const created = await prisma.expenseCategory.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        tenantId,
        subsidiaryId,
      },
    });

    res.status(201).json({
      message: "Expense category created successfully.",
      category: created,
    });
  }
);

// ✅ Actualizar ExpenseCategory
export const updateExpenseCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.expenseCategory.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Expense category not found." });
    }

    let normalizedName: string | undefined = undefined;

    if (name) {
      normalizedName = normalizeExpenseCategoryName(name);

      if (normalizedName !== existing.name) {
        const duplicate = await prisma.expenseCategory.findFirst({
          where: {
            id: { not: id },
            name: normalizedName,
            tenantId: existing.tenantId,
            subsidiaryId: existing.subsidiaryId,
          },
        });

        if (duplicate) {
          return res.status(409).json({
            message:
              "Another expense category with this name already exists for this tenant and subsidiary.",
          });
        }
      }
    }

    const updated = await prisma.expenseCategory.update({
      where: { id },
      data: {
        name: normalizedName ?? undefined,
        description: description
          ? normalizeExpenseCategoryDescription(description)
          : undefined,
      },
    });

    res.json({
      message: "Expense category updated successfully.",
      category: updated,
    });
  }
);

// ✅ Obtener todas las ExpenseCategories de un tenant y/o sucursal
export const getExpenseCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, status, page = "1", limit = "5" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: subsidiaryId as string };

    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.OR = [
        {
          name: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: normalizedSearch,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }

    const take = Math.max(parseInt(limit as string) || 5, 5); // mínimo 5
    const skip = (parseInt(page as string) - 1) * take;

    const [total, categories] = await Promise.all([
      prisma.expenseCategory.count({ where }),
      prisma.expenseCategory.findMany({
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
      categories,
    });
  }
);

// ✅ Obtener una ExpenseCategory por ID
export const getExpenseCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: "Expense category not found." });
    }

    res.json(category);
  }
);

export const toggleExpenseCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1️⃣ Buscar la categoría
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({ message: "Expense category not found." });
    }

    // 2️⃣ Invertir status actual
    const updated = await prisma.expenseCategory.update({
      where: { id },
      data: { status: !category.status }, // Invierte el status
    });

    // 3️⃣ Respuesta
    res.json({
      message: `Expense category status changed to ${
        updated.status ? "active" : "inactive"
      }.`,
      category: updated,
    });
  }
);

// ✅ Obtener solo las ExpenseCategories activas (status = true) de una subsidiaria específica
export const getActiveExpenseCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeCategories = await prisma.expenseCategory.findMany({
      where: {
        subsidiaryId,
        status: true,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    res.json({
      total: activeCategories.length,
      categories: activeCategories,
    });
  }
);