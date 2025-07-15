// src/controllers/incomeCategory.controller.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeIncomeCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeIncomeCategoryDescription(value: string): string {
  return value.replace(/ñ/gi, "n").replace(/\s+/g, " ").trim();
}

// ✅ Crear IncomeCategory
export const createIncomeCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, tenantId, subsidiaryId } = req.body;

    const normalizedName = normalizeIncomeCategoryName(name);
    const normalizedDescription = description
      ? normalizeIncomeCategoryDescription(description)
      : null;

    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id: subsidiaryId },
    });

    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found." });
    }

    if (subsidiary.tenantId !== tenantId) {
      return res.status(400).json({
        message: "The Subsidiary does not belong to the specified Tenant.",
      });
    }

    const exists = await prisma.incomeCategory.findFirst({
      where: {
        name: normalizedName,
        tenantId,
        subsidiaryId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message:
          "An income category with this name already exists for this tenant and subsidiary.",
      });
    }

    const created = await prisma.incomeCategory.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        tenantId,
        subsidiaryId,
      },
    });

    res.status(201).json({
      message: "Income category created successfully.",
      category: created,
    });
  }
);

// ✅ Actualizar IncomeCategory
export const updateIncomeCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.incomeCategory.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Income category not found." });
    }

    let normalizedName: string | undefined = undefined;

    if (name) {
      normalizedName = normalizeIncomeCategoryName(name);

      if (normalizedName !== existing.name) {
        const duplicate = await prisma.incomeCategory.findFirst({
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
              "Another income category with this name already exists for this tenant and subsidiary.",
          });
        }
      }
    }

    const updated = await prisma.incomeCategory.update({
      where: { id },
      data: {
        name: normalizedName ?? undefined,
        description: description
          ? normalizeIncomeCategoryDescription(description)
          : undefined,
      },
    });

    res.json({
      message: "Income category updated successfully.",
      category: updated,
    });
  }
);

// ✅ Obtener IncomeCategories por Subsidiary
export const getIncomeCategoriesBySubsidiary = asyncHandler(
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
        { name: { contains: normalizedSearch, mode: "insensitive" } },
        { description: { contains: normalizedSearch, mode: "insensitive" } },
      ];
    }

    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }

    const take = Math.max(parseInt(limit as string) || 5, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, categories] = await Promise.all([
      prisma.incomeCategory.count({ where }),
      prisma.incomeCategory.findMany({
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

// ✅ Obtener IncomeCategory por ID
export const getIncomeCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.incomeCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Income category not found." });
    }

    res.json(category);
  }
);

// ✅ Toggle IncomeCategory status
export const toggleIncomeCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.incomeCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Income category not found." });
    }

    const updated = await prisma.incomeCategory.update({
      where: { id },
      data: { status: !category.status },
    });

    res.json({
      message: `Income category status changed to ${
        updated.status ? "active" : "inactive"
      }.`,
      category: updated,
    });
  }
);

// ✅ Obtener solo IncomeCategories activas por Subsidiary
export const getActiveIncomeCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeCategories = await prisma.incomeCategory.findMany({
      where: { subsidiaryId, status: true },
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
