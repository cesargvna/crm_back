// src/controllers/productCategory.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helper de normalización
export function normalizeProductCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")
    .trim();
}

// ✅ Crear ProductCategory
export const createProductCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizeProductCategoryName(name);

  // ✅ Validar duplicado por nombre y sucursal
  const exists = await prisma.productCategory.findFirst({
    where: {
      name: normalizedName,
      subsidiaryId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "A product category with this name already exists for this subsidiary.",
    });
  }

  const created = await prisma.productCategory.create({
    data: {
      name: normalizedName,
      description,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Product category created successfully.",
    productCategory: created,
  });
});

// ✅ Actualizar ProductCategory
export const updateProductCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const existing = await prisma.productCategory.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Product category not found." });
  }

  let normalizedName: string | undefined = undefined;

  if (name) {
    normalizedName = normalizeProductCategoryName(name);

    if (normalizedName !== existing.name) {
      const duplicate = await prisma.productCategory.findFirst({
        where: {
          id: { not: id },
          name: normalizedName,
          subsidiaryId: existing.subsidiaryId,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another product category with this name already exists for this subsidiary.",
        });
      }
    }
  }

  const updated = await prisma.productCategory.update({
    where: { id },
    data: {
      name: normalizedName ?? undefined,
      description: description ?? undefined,
    },
  });

  res.json({
    message: "Product category updated successfully.",
    productCategory: updated,
  });
});

// ✅ Obtener ProductCategories por Subsidiary
export const getProductCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      search,
      status,
      page = "1",
      limit = "5",
    } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: subsidiaryId as string };

    // 🔍 Búsqueda opcional
    if (search && String(search).trim().length >= 2) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.name = { contains: normalizedSearch, mode: "insensitive" };
    }

    // ✅ Filtro por estado
    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }

    // 📄 Paginación
    const take = Math.max(parseInt(limit as string) || 5, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, categories] = await Promise.all([
      prisma.productCategory.count({ where }),
      prisma.productCategory.findMany({
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

// ✅ Obtener ProductCategory por ID
export const getProductCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.productCategory.findUnique({
    where: { id },
  });

  if (!category) {
    return res.status(404).json({ message: "Product category not found." });
  }

  res.json(category);
});

// ✅ Toggle status ProductCategory
export const toggleProductCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.productCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Product category not found." });
    }

    const updated = await prisma.productCategory.update({
      where: { id },
      data: { status: !category.status },
    });

    res.json({
      message: `Product category status changed to ${
        updated.status ? "active" : "inactive"
      }.`,
      productCategory: updated,
    });
  }
);

// ✅ Obtener solo ProductCategories activos por Subsidiary
export const getActiveProductCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeCategories = await prisma.productCategory.findMany({
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
