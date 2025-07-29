import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { Prisma, StockUpdateReason } from "../../../generated/prisma";
import { syncProductAndCategoryStatus } from "../../service/syncStatus.service"; // 👈 IMPORTANTE

const normalizeString = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ñ/gi, "n")
    .trim()
    .toLowerCase();
};

const isValidStockUpdateReason = (value: any): value is StockUpdateReason => {
  return Object.values(StockUpdateReason).includes(value);
};

export const getInventoryBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      reason,
      categoryId,
      status, // ✅ nuevo filtro por estado
    } = req.query;

    const validPageSizes = [5, 10, 25, 50, 100, 500];
    const pageNumber = parseInt(page as string, 10) || 1;
    let pageSize = parseInt(limit as string, 10) || 5;
    if (!validPageSizes.includes(pageSize)) pageSize = 5;
    const skip = (pageNumber - 1) * pageSize;

    const normalizedSearch = normalizeString(search as string);

    const whereClause: Prisma.InventoryWhereInput = {
      subsidiaryId,
      ...(isValidStockUpdateReason(reason) ? { lastUpdateReason: reason } : {}),
      product: {
        ...(categoryId && categoryId !== "all"
          ? { productCategoryId: categoryId as string }
          : {}),
        ...(status !== undefined && status !== "all"
          ? { status: status === "true" }
          : {}),
        AND: [
          {
            OR: [
              { name: { contains: normalizedSearch, mode: "insensitive" } },
              { description: { contains: normalizedSearch, mode: "insensitive" } },
              { code: { contains: normalizedSearch, mode: "insensitive" } },
              { barcode: { contains: normalizedSearch, mode: "insensitive" } },
            ],
          },
        ],
      },
    };

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { updated_at: "desc" },
        include: {
          product: {
            include: {
              productCategory: true,
              unitMeasurement: true,
              productPrices: {
                include: {
                  priceType: { include: { currency: true } },
                },
              },
            },
          },
        },
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    const inventoryWithRelations = await Promise.all(
      inventory.map(async (item) => {
        const [user, lastPurchaseDetail] = await Promise.all([
          prisma.user.findUnique({
            where: { id: item.userId },
            select: {
              id: true,
              username: true,
              name: true,
              lastname: true,
              email: true,
              role: { select: { name: true } },
            },
          }),
          prisma.purchaseDetail.findFirst({
            where: {
              productId: item.productId,
              subsidiaryId: item.subsidiaryId,
            },
            orderBy: { created_at: "desc" },
            select: {
              price: true,
              created_at: true,
              purchase: {
                select: {
                  supplier: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
            },
          }),
        ]);

        return {
          ...item,
          user,
          barcode: item.product.barcode, // ✅ incluir barcode
          productStatus: item.product.status, // ✅ incluir estado
          lastSupplier: lastPurchaseDetail?.purchase?.supplier || null,
          lastPurchasePrice: lastPurchaseDetail?.price || null,
          lastPurchaseDate: lastPurchaseDetail?.created_at || null,
        };
      })
    );

    res.json({
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      pageSizeOptions: validPageSizes,
      data: inventoryWithRelations,
    });
  }
);

// ✅ Crear inventario
export const createInventory = asyncHandler(async (req: Request, res: Response) => {
  const {
    productId,
    quantity_available,
    min_quantity,
    userId,
    tenantId,
    subsidiaryId,
  } = req.body;

  const existing = await prisma.inventory.findUnique({
    where: { productId_subsidiaryId: { productId, subsidiaryId } },
  });

  if (existing) {
    return res.status(409).json({
      message: "An inventory for this product and subsidiary already exists.",
    });
  }

  const created = await prisma.inventory.create({
    data: {
      productId,
      quantity_available,
      min_quantity,
      userId,
      tenantId,
      subsidiaryId,
      lastUpdateReason: "AJUSTE",
      lastUpdateQuantity: 0,
    },
  });

  // 🧠 Lógica de activación automática
  await syncProductAndCategoryStatus(productId);

  res.status(201).json({
    message: "Inventory created successfully.",
    ...created,
  });
});

// ✅ Actualizar inventario
export const updateInventory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity_available, min_quantity, userId } = req.body;

  const existing = await prisma.inventory.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Inventory not found." });

  const updated = await prisma.inventory.update({
    where: { id },
    data: {
      quantity_available,
      min_quantity,
      userId,
      lastUpdateReason: "AJUSTE",
      lastUpdateQuantity: 0,
    },
  });

  // 🧠 Lógica de sincronización automática
  await syncProductAndCategoryStatus(updated.productId);

  res.json({
    message: "Inventory updated successfully.",
    ...updated,
  });
});

// ✅ Productos sin inventario por sucursal (con filtros)
export const getProductsWithoutInventory = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      search = "",
      categoryId,
      status = "all",
      page = "1",
      limit = "5",
    } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "Subsidiary ID is required." });
    }

    const normalizedSearch = (search as string).trim();

    const statusFilter =
      status === "true" ? true : status === "false" ? false : undefined;

    const whereClause: Prisma.ProductWhereInput = {
      AND: [
        { subsidiaryId },

        ...(categoryId && categoryId !== "all"
          ? [{ productCategoryId: categoryId as string }]
          : []),

        ...(statusFilter !== undefined ? [{ status: statusFilter }] : []),

        {
          inventory: {
            none: {
              subsidiaryId,
            },
          },
        },

        {
          OR: [
            {
              name: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              barcode: {
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
          ],
        },
      ],
    };

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 5;
    const skip = (pageNumber - 1) * pageSize;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
        include: {
          productCategory: true,
          unitMeasurement: true,
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    res.json({
      total,
      products,
    });
  }
);