import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeSupplierName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSupplierEmail(value: string): string {
  return value.trim().toLowerCase();
}

// ✅ Crear Supplier
export const createSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      company,
      phone,
      telephone,
      email,
      tenantId,
      subsidiaryId,
      supplierCategoryId,
    } = req.body;

    const normalizedName = normalizeSupplierName(name);
    const normalizedEmail = email ? normalizeSupplierEmail(email) : null;

    // ✅ Validar categoría de proveedor
    const category = await prisma.supplierCategory.findUnique({
      where: { id: supplierCategoryId },
    });

    if (!category) {
      return res.status(404).json({ message: "Supplier category not found." });
    }

    if (
      category.tenantId !== tenantId ||
      category.subsidiaryId !== subsidiaryId
    ) {
      return res.status(400).json({
        message:
          "The Supplier Category does not belong to the specified Tenant/Subsidiary.",
      });
    }

    // ✅ Validar duplicado por nombre
    const exists = await prisma.supplier.findFirst({
      where: {
        name: normalizedName,
        tenantId,
        subsidiaryId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message:
          "A supplier with this name already exists for this tenant and subsidiary.",
      });
    }

    const created = await prisma.supplier.create({
      data: {
        name: normalizedName,
        description,
        company,
        phone,
        telephone,
        email: normalizedEmail,
        tenantId,
        subsidiaryId,
        supplierCategoryId,
      },
    });

    res.status(201).json({
      message: "Supplier created successfully.",
      supplier: created,
    });
  }
);

// ✅ Actualizar Supplier
export const updateSupplier = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      description,
      company,
      phone,
      telephone,
      email,
      supplierCategoryId,
    } = req.body;

    const existing = await prisma.supplier.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    let normalizedName: string | undefined = undefined;
    let normalizedEmail: string | undefined = undefined;

    if (name) {
      normalizedName = normalizeSupplierName(name);

      if (normalizedName !== existing.name) {
        const duplicate = await prisma.supplier.findFirst({
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
              "Another supplier with this name already exists for this tenant and subsidiary.",
          });
        }
      }
    }

    if (email) {
      normalizedEmail = normalizeSupplierEmail(email);
    }

    // ✅ Si se cambia de categoría, validar pertenencia
    if (
      supplierCategoryId &&
      supplierCategoryId !== existing.supplierCategoryId
    ) {
      const category = await prisma.supplierCategory.findUnique({
        where: { id: supplierCategoryId },
      });

      if (!category) {
        return res
          .status(404)
          .json({ message: "Supplier category not found." });
      }

      if (
        category.tenantId !== existing.tenantId ||
        category.subsidiaryId !== existing.subsidiaryId
      ) {
        return res.status(400).json({
          message:
            "The new Supplier Category does not belong to the same Tenant/Subsidiary.",
        });
      }
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        name: normalizedName ?? undefined,
        description,
        company,
        phone,
        telephone,
        email: normalizedEmail ?? undefined,
        supplierCategoryId: supplierCategoryId ?? undefined,
      },
    });

    res.json({
      message: "Supplier updated successfully.",
      supplier: updated,
    });
  }
);

// ✅ Obtener Suppliers por Subsidiary
export const getSuppliersBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, status, categoryId, page = "1", limit = "5" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: subsidiaryId as string };

    // 🔍 Búsqueda opcional
    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.OR = [
        { name: { contains: normalizedSearch, mode: "insensitive" } },
        { company: { contains: normalizedSearch, mode: "insensitive" } },
        { phone: { contains: normalizedSearch, mode: "insensitive" } },
      ];
    }

    // ✅ Filtro por estado
    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }

    // ✅ Filtro por categoría
    if (categoryId && categoryId !== "all") {
      where.supplierCategoryId = categoryId as string;
    }

    // 📄 Paginación
    const take = Math.max(parseInt(limit as string) || 5, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, suppliers] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
        include: { supplierCategory: true },
      }),
    ]);

    res.json({
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
      suppliers,
    });
  }
);

// ✅ Obtener Supplier por ID
export const getSupplierById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { supplierCategory: true },
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    res.json(supplier);
  }
);

// ✅ Toggle Supplier status
export const toggleSupplierStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: { status: !supplier.status },
    });

    res.json({
      message: `Supplier status changed to ${
        updated.status ? "active" : "inactive"
      }.`,
      supplier: updated,
    });
  }
);

// ✅ Obtener solo Suppliers activos por Subsidiary
export const getActiveSuppliersBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeSuppliers = await prisma.supplier.findMany({
      where: { subsidiaryId, status: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        email: true,
      },
    });

    res.json({
      total: activeSuppliers.length,
      suppliers: activeSuppliers,
    });
  }
);

// ✅ Obtener todas SupplierCategories por Subsidiary (sin filtros, sin paginación)
export const getAllSupplierCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const categories = await prisma.supplierCategory.findMany({
      where: { subsidiaryId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    res.json({
      total: categories.length,
      categories,
    });
  }
);
