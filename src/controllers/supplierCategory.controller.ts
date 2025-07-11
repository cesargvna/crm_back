import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeSupplierCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/gi, "n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeSupplierCategoryDescription(value: string): string {
  return value.replace(/ñ/gi, "n").replace(/\s+/g, " ").trim();
}

// ✅ Crear SupplierCategory
export const createSupplierCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, tenantId, subsidiaryId } = req.body;

    const normalizedName = normalizeSupplierCategoryName(name);
    const normalizedDescription = description
      ? normalizeSupplierCategoryDescription(description)
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

    const exists = await prisma.supplierCategory.findFirst({
      where: {
        name: normalizedName,
        tenantId,
        subsidiaryId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message:
          "A supplier category with this name already exists for this tenant and subsidiary.",
      });
    }

    const created = await prisma.supplierCategory.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        tenantId,
        subsidiaryId,
      },
    });

    res.status(201).json({
      message: "Supplier category created successfully.",
      category: created,
    });
  }
);

// ✅ Actualizar SupplierCategory
export const updateSupplierCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.supplierCategory.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Supplier category not found." });
    }

    let normalizedName: string | undefined = undefined;

    if (name) {
      normalizedName = normalizeSupplierCategoryName(name);

      if (normalizedName !== existing.name) {
        const duplicate = await prisma.supplierCategory.findFirst({
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
              "Another supplier category with this name already exists for this tenant and subsidiary.",
          });
        }
      }
    }

    const updated = await prisma.supplierCategory.update({
      where: { id },
      data: {
        name: normalizedName ?? undefined,
        description: description
          ? normalizeSupplierCategoryDescription(description)
          : undefined,
      },
    });

    res.json({
      message: "Supplier category updated successfully.",
      category: updated,
    });
  }
);

// ✅ Obtener SupplierCategories por Subsidiary
export const getSupplierCategoriesBySubsidiary = asyncHandler(
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
      prisma.supplierCategory.count({ where }),
      prisma.supplierCategory.findMany({
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

// ✅ Obtener SupplierCategory por ID
export const getSupplierCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.supplierCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Supplier category not found." });
    }

    res.json(category);
  }
);

// ✅ Toggle SupplierCategory status
export const toggleSupplierCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.supplierCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Supplier category not found." });
    }

    const newStatus = !category.status;

    const updatedCategory = await prisma.supplierCategory.update({
      where: { id },
      data: { status: newStatus },
    });

    // Desactiva o activa todos los proveedores relacionados
    await prisma.supplier.updateMany({
      where: { supplierCategoryId: id },
      data: { status: newStatus },
    });

    res.json({
      message: `Supplier category status changed to ${
        newStatus ? "active" : "inactive"
      }, and all related suppliers have been ${newStatus ? "activated" : "deactivated"}.`,
      category: updatedCategory,
    });
  }
);

// ✅ Obtener solo SupplierCategories activas por Subsidiary
export const getActiveSupplierCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeCategories = await prisma.supplierCategory.findMany({
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
