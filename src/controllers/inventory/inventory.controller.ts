import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { Prisma, StockUpdateReason } from "../../../generated/prisma";

// Valida si el motivo es uno de los del enum
const isValidStockUpdateReason = (value: any): value is StockUpdateReason => {
  return Object.values(StockUpdateReason).includes(value);
};

// ✅ GET: /inventory/by-subsidiary/:subsidiaryId
export const getInventoryBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      page = "1",
      limit = "10",
      search = "",
      reason,
      categoryId,
    } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Construcción de filtros
    const whereClause: Prisma.InventoryWhereInput = {
      subsidiaryId,
      ...(isValidStockUpdateReason(reason) ? { lastUpdateReason: reason } : {}),
      product: {
        ...(categoryId && categoryId !== "all"
          ? {
              productCategoryId: categoryId as string,
              AND: [
                {
                  OR: [
                    { name: { contains: search as string, mode: "insensitive" } },
                    { description: { contains: search as string, mode: "insensitive" } },
                  ],
                },
              ],
            }
          : {
              OR: [
                { name: { contains: search as string, mode: "insensitive" } },
                { description: { contains: search as string, mode: "insensitive" } },
              ],
            }),
      },
    };

    // Consulta principal
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
                  priceType: {
                    include: {
                      currency: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    // Enriquecer los registros con usuario y últimos datos de compra
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
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          }),
        ]);

        return {
          ...item,
          user,
          lastSupplier: lastPurchaseDetail?.purchase?.supplier || null,
          lastPurchasePrice: lastPurchaseDetail?.price || null,
          lastPurchaseDate: lastPurchaseDetail?.created_at || null,
        };
      })
    );

    // Respuesta final
    res.json({
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: inventoryWithRelations,
    });
  }
);