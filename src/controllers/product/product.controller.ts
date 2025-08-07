// src/controllers/product.controller.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeProductName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeProductCode(value: string): string {
  return value.trim().toUpperCase();
}

// ✅ Crear Product
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    barcode,
    name,
    description,
    productCategoryId,
    unitMeasurementId,
    tenantId,
    subsidiaryId,
  } = req.body;

  const normalizedName = normalizeProductName(name);
  const normalizedCode = normalizeProductCode(code);

  // Validar duplicado por code y name dentro del mismo tenant y sucursal
  const exists = await prisma.product.findFirst({
    where: {
      code: normalizedCode,
      name: normalizedName,
      tenantId,
      subsidiaryId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "A product with this code and name already exists for this tenant and subsidiary.",
    });
  }

  const created = await prisma.product.create({
    data: {
      code: normalizedCode,
      barcode,
      name: normalizedName,
      description,
      productCategoryId,
      unitMeasurementId,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Product created successfully.",
    product: created,
  });
});

// ✅ Actualizar Product
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, barcode, name, description, productCategoryId, unitMeasurementId } = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Product not found." });
  }

  let normalizedName: string | undefined;
  let normalizedCode: string | undefined;

  if (name) normalizedName = normalizeProductName(name);
  if (code) normalizedCode = normalizeProductCode(code);

  // Validar duplicado si cambian code o name
  if (normalizedName || normalizedCode) {
    const duplicate = await prisma.product.findFirst({
      where: {
        id: { not: id },
        name: normalizedName ?? existing.name,
        code: normalizedCode ?? existing.code,
        tenantId: existing.tenantId,
        subsidiaryId: existing.subsidiaryId,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another product with this code and name already exists for this tenant and subsidiary.",
      });
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      code: normalizedCode ?? undefined,
      barcode: barcode ?? undefined,
      name: normalizedName ?? undefined,
      description: description ?? undefined,
      productCategoryId: productCategoryId ?? undefined,
      unitMeasurementId: unitMeasurementId ?? undefined,
    },
  });

  res.json({
    message: "Product updated successfully.",
    product: updated,
  });
});

export const getProductsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      search,
      status,
      productCategoryId,
      page = "1",
      limit = "10",
    } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: subsidiaryId as string };

    // Filtro por búsqueda
    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.OR = [
        { name: { contains: normalizedSearch, mode: "insensitive" } },
        { code: { contains: normalizedSearch, mode: "insensitive" } },
        { barcode: { contains: normalizedSearch, mode: "insensitive" } },
        { description: { contains: normalizedSearch, mode: "insensitive" } },
      ];
    }

    // Filtro por estado
    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }

    // Filtro por categoría
    if (productCategoryId && productCategoryId !== "all") {
      where.productCategoryId = productCategoryId as string;
    }

    const take = Math.max(parseInt(limit as string) || 10, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
        include: {
          productCategory: true,
          unitMeasurement: true,
          inventory: {
            where: { subsidiaryId: subsidiaryId as string },
            select: {
              id: true,
              quantity_available: true,
              min_quantity: true,
              lastUpdateReason: true,
              lastUpdateQuantity: true,
            },
          },
        },
      }),
    ]);

    res.json({
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
      products,
    });
  }
);

// ✅ Obtener Product por ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      productCategory: true,
      unitMeasurement: true,
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.json(product);
});

// ✅ Toggle Product status (mejorado con control de inventario)
export const toggleProductStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      inventory: true, // para verificar disponibilidad
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  const currentStatus = product.status;

  // ⚠️ Si el producto está inactivo y se quiere activar, verificar inventario
  if (!currentStatus) {
    // No tiene inventario
    if (!product.inventory || product.inventory.length === 0) {
      return res.status(400).json({
        message: "No se puede activar un producto sin inventario registrado.",
      });
    }

    // Tiene inventario, pero todo en cero
    const totalDisponible = product.inventory.reduce(
      (acc, item) => acc + item.quantity_available,
      0
    );

    if (totalDisponible <= 0) {
      return res.status(400).json({
        message: "No se puede activar un producto cuyo inventario está agotado.",
      });
    }
  }

  // ✅ Cambiar el estado
  const updated = await prisma.product.update({
    where: { id },
    data: { status: !currentStatus },
  });

  res.json({
    message: `Estado del producto cambiado a ${updated.status ? "activo" : "inactivo"}.`,
    product: updated,
  });
});

export const getActiveProductsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeProducts = await prisma.product.findMany({
      where: { subsidiaryId, status: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        barcode: true,
        description: true,
      },
    });

    res.json({
      total: activeProducts.length,
      products: activeProducts,
    });
  }
);

export const getAllProductsForSale = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { page = "1", limit = "5" } = req.query;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const pageNumber = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 5;
  const pageSize = Math.min(Math.max(parsedLimit, 5), 500); // Limitar entre 5 y 500
  const skip = (pageNumber - 1) * pageSize;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { subsidiaryId },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      include: {
        productCategory: true,
        unitMeasurement: true,
        inventory: {
          where: { subsidiaryId },
          select: {
            id: true,
            quantity_available: true,
            min_quantity: true,
            lastUpdateReason: true,
            lastUpdateQuantity: true,
          },
        },
        productPrices: {
          where: { subsidiaryId },
          include: {
            priceType: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    }),
    prisma.product.count({
      where: { subsidiaryId },
    }),
  ]);

  res.json({ total, products });
});


export const getActiveProductsWithStockForSale = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const { page = "1", limit = "5" } = req.query;

  if (!subsidiaryId) {
    return res.status(400).json({ message: "subsidiaryId is required." });
  }

  const pageNumber = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 5;
  const pageSize = Math.min(Math.max(parsedLimit, 5), 500); // Limitar entre 5 y 500
  const skip = (pageNumber - 1) * pageSize;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        subsidiaryId,
        status: true,
        inventory: {
          some: {
            subsidiaryId,
            quantity_available: { gt: 0 },
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
      include: {
        productCategory: true,
        unitMeasurement: true,
        inventory: {
          where: { subsidiaryId },
          select: {
            id: true,
            quantity_available: true,
            min_quantity: true,
            lastUpdateReason: true,
            lastUpdateQuantity: true,
          },
        },
        productPrices: {
          where: { subsidiaryId },
          include: {
            priceType: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    }),
    prisma.product.count({
      where: {
        subsidiaryId,
        status: true,
        inventory: {
          some: {
            subsidiaryId,
            quantity_available: { gt: 0 },
          },
        },
      },
    }),
  ]);

  res.json({ total, products });
});