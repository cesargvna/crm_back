import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  PaymentType,
  PaymentStatus,
  DispatchStatus,
  Prisma,
} from "../../../generated/prisma";

export const getPurchasesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const {
    search = "",
    supplierCategoryId,
    userId,
    paymentType,
    paymentStatus,
    dispatchStatus,
    purchaseDateFrom,
    purchaseDateTo,
    page = "1",
    limit = "10",
  } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;
  const parsedLimit = parseInt(limit as string, 10) || 10;
  const pageSize = Math.max(parsedLimit, 5);
  const skip = (pageNumber - 1) * pageSize;

  const normalizedSearch = (search as string).trim().toLowerCase();

  const whereClause: Prisma.PurchaseWhereInput = {
    subsidiaryId,
    ...(paymentType ? { paymentType: paymentType as PaymentType } : {}),
    ...(paymentStatus ? { paymentStatus: paymentStatus as PaymentStatus } : {}),
    ...(dispatchStatus ? { dispatchStatus: dispatchStatus as DispatchStatus } : {}),
    ...(userId ? { userId: userId as string } : {}),
    ...(purchaseDateFrom || purchaseDateTo
      ? {
          purchaseDate: {
            ...(purchaseDateFrom ? { gte: new Date(purchaseDateFrom as string) } : {}),
            ...(purchaseDateTo ? { lte: new Date(purchaseDateTo as string) } : {}),
          },
        }
      : {}),
    ...(supplierCategoryId && supplierCategoryId !== "all"
      ? {
          supplier: {
            supplierCategoryId: supplierCategoryId as string,
          },
        }
      : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { code: { contains: normalizedSearch, mode: "insensitive" } },
            {
              supplier: {
                OR: [
                  { name: { contains: normalizedSearch, mode: "insensitive" } },
                  { email: { contains: normalizedSearch, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { purchaseDate: "desc" },
      include: {
        supplier: {
          include: {
            supplierCategory: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            lastname: true,
            role: { select: { name: true } },
          },
        },
        purchaseDetails: {
          select: {
            id: true,
            price: true,
            quantity: true,
            sub_total: true,
            currencyId: true,
            product: {
              select: {
                id: true,
                name: true,
                code: true,
                barcode: true,
                description: true,
                status: true,
                productCategory: true,
                unitMeasurement: true,
              },
            },
          },
        },
        creditPayments: true,
      },
    }),
    prisma.purchase.count({ where: whereClause }),
  ]);

  res.json({
    total,
    page: pageNumber,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    data: purchases,
  });
});

export const getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: {
        include: {
          supplierCategory: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          lastname: true,
          role: { select: { name: true } },
        },
      },
      purchaseDetails: {
        select: {
          id: true,
          price: true,
          quantity: true,
          sub_total: true,
          currencyId: true,
          product: {
            select: {
              id: true,
              name: true,
              code: true,
              barcode: true,
              description: true,
              status: true,
              productCategory: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  description: true,
                },
              },
              unitMeasurement: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                },
              },
            },
          },
        },
      },
      creditPayments: true,
    },
  });

  if (!purchase) {
    return res.status(404).json({ message: "Compra no encontrada." });
  }

  res.json(purchase);
});

/* createPurchaseWithPriceSync 
  * Este crea la compra + actualiza o crea precios automáticamente según los PriceType activos.
*/
export const createPurchaseWithPriceSync = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    purchaseDate,
    paymentType,
    dispatchStatus,
    paymentStatus,
    supplierId,
    userId,
    tenantId,
    subsidiaryId,
    note,
    purchaseDetails,
  } = req.body;

  const total = purchaseDetails.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const createdPurchase = await prisma.purchase.create({
    data: {
      code,
      purchaseDate: new Date(purchaseDate),
      paymentType,
      dispatchStatus,
      paymentStatus,
      note,
      supplierId,
      userId,
      tenantId,
      subsidiaryId,
      total,
    },
  });

  const activePriceTypes = await prisma.priceType.findMany({
    where: {
      status: true,
      tenantId,
      subsidiaryId,
    },
  });

  for (const detail of purchaseDetails) {
    const { productId, price, quantity, currencyId } = detail;

    await prisma.purchaseDetail.create({
      data: {
        price,
        quantity,
        sub_total: price * quantity,
        productId,
        purchaseId: createdPurchase.id,
        userId,
        supplierId,
        currencyId,
        tenantId,
        subsidiaryId,
      },
    });

    const existingInventory = await prisma.inventory.findUnique({
      where: {
        productId_subsidiaryId: {
          productId,
          subsidiaryId,
        },
      },
    });

    if (existingInventory) {
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: {
          quantity_available: existingInventory.quantity_available + quantity,
          lastUpdateReason: "COMPRA",
          lastUpdateQuantity: quantity,
          userId,
        },
      });
    } else {
      await prisma.inventory.create({
        data: {
          productId,
          quantity_available: quantity,
          min_quantity: 0,
          lastUpdateReason: "COMPRA",
          lastUpdateQuantity: quantity,
          userId,
          tenantId,
          subsidiaryId,
        },
      });
    }

    for (const priceType of activePriceTypes) {
      const generatedPrice = price * (1 + Number(priceType.marginPercent) / 100);

      const existingPrice = await prisma.productPrice.findUnique({
        where: {
          productId_priceTypeId_subsidiaryId: {
            productId,
            priceTypeId: priceType.id,
            subsidiaryId,
          },
        },
      });

      if (existingPrice) {
        if (existingPrice.autoGenerated) {
          await prisma.productPrice.update({
            where: {
              productId_priceTypeId_subsidiaryId: {
                productId,
                priceTypeId: priceType.id,
                subsidiaryId,
              },
            },
            data: {
              price: generatedPrice,
            },
          });
        }
      } else {
        await prisma.productPrice.create({
          data: {
            productId,
            priceTypeId: priceType.id,
            tenantId,
            subsidiaryId,
            price: generatedPrice,
            autoGenerated: true,
            editable: false,
          },
        });
      }
    }
  }

  res.status(201).json({
    message: "Compra registrada con precios generados/actualizados.",
    purchaseId: createdPurchase.id,
  });
});

/* createPurchaseManualPrices
  * Este solo registra la compra y el inventario, y no toca los precios. 
*/
export const createPurchaseManualPrices = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    purchaseDate,
    paymentType,
    dispatchStatus,
    paymentStatus,
    supplierId,
    userId,
    tenantId,
    subsidiaryId,
    note,
    purchaseDetails,
  } = req.body;

  const total = purchaseDetails.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const createdPurchase = await prisma.purchase.create({
    data: {
      code,
      purchaseDate: new Date(purchaseDate),
      paymentType,
      dispatchStatus,
      paymentStatus,
      note,
      supplierId,
      userId,
      tenantId,
      subsidiaryId,
      total,
    },
  });

  for (const detail of purchaseDetails) {
    const { productId, price, quantity, currencyId } = detail;

    await prisma.purchaseDetail.create({
      data: {
        price,
        quantity,
        sub_total: price * quantity,
        productId,
        purchaseId: createdPurchase.id,
        userId,
        supplierId,
        currencyId,
        tenantId,
        subsidiaryId,
      },
    });

    const existingInventory = await prisma.inventory.findUnique({
      where: {
        productId_subsidiaryId: {
          productId,
          subsidiaryId,
        },
      },
    });

    if (existingInventory) {
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: {
          quantity_available: existingInventory.quantity_available + quantity,
          lastUpdateReason: "COMPRA",
          lastUpdateQuantity: quantity,
          userId,
        },
      });
    } else {
      await prisma.inventory.create({
        data: {
          productId,
          quantity_available: quantity,
          min_quantity: 0,
          lastUpdateReason: "COMPRA",
          lastUpdateQuantity: quantity,
          userId,
          tenantId,
          subsidiaryId,
        },
      });
    }
  }

  res.status(201).json({
    message: "Compra registrada sin modificación de precios.",
    purchaseId: createdPurchase.id,
  });
});
