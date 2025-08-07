import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateNextSaleCode } from "../../utils/generateNextSaleCode";
import {
  PaymentType,
  PaymentStatus,
  SalesStatus,
  DiscountType,
  Prisma,
  StockUpdateReason,
} from "../../../generated/prisma";

export const getSalesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      search = "",
      userId,
      clientCategoryId, // ✅ nuevo filtro
      paymentType,
      paymentStatus,
      salesStatus,
      discountType,
      saleDateFrom,
      saleDateTo,
      page = "1",
      limit = "5",
    } = req.query;

    // ✅ Validate date range (from <= to)
    if (saleDateFrom && saleDateTo) {
      const from = new Date(saleDateFrom as string);
      const to = new Date(saleDateTo as string);
      if (from > to) {
        return res.status(400).json({
          message: "'From Date' cannot be later than 'To Date'.",
        });
      }
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;
    const pageSize = Math.max(parsedLimit, 5);
    const skip = (pageNumber - 1) * pageSize;
    const normalizedSearch = (search as string).trim().toLowerCase();

    const whereClause: Prisma.SaleWhereInput = {
      subsidiaryId,
      ...(paymentType ? { paymentType: paymentType as PaymentType } : {}),
      ...(paymentStatus
        ? { paymentStatus: paymentStatus as PaymentStatus }
        : {}),
      ...(salesStatus ? { salesStatus: salesStatus as SalesStatus } : {}),
      ...(discountType ? { discountType: discountType as DiscountType } : {}),
      ...(userId ? { userId: userId as string } : {}),
      ...(clientCategoryId
        ? { client: { clientCategoryId: clientCategoryId as string } }
        : {}),
      ...(saleDateFrom || saleDateTo
        ? {
            saleDate: {
              ...(saleDateFrom
                ? { gte: new Date(saleDateFrom as string) }
                : {}),
              ...(saleDateTo ? { lte: new Date(saleDateTo as string) } : {}),
            },
          }
        : {}),
      ...(normalizedSearch
        ? {
            OR: [
              { code: { contains: normalizedSearch, mode: "insensitive" } },
              {
                client: {
                  OR: [
                    {
                      name: { contains: normalizedSearch, mode: "insensitive" },
                    },
                    {
                      email: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                    {
                      clientCategory: {
                        name: {
                          contains: normalizedSearch,
                          mode: "insensitive",
                        },
                      },
                    },
                  ],
                },
              },
              {
                user: {
                  OR: [
                    {
                      name: { contains: normalizedSearch, mode: "insensitive" },
                    },
                    {
                      username: {
                        contains: normalizedSearch,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: [{ saleDate: "desc" }, { created_at: "desc" }],
        include: {
          client: {
            include: {
              clientCategory: true,
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
          saleDetails: {
            select: {
              id: true,
              price: true,
              quantity: true,
              subtotal: true,
              manualPrice: true,
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
          saleCreditPayments: true,
        },
      }),
      prisma.sale.count({ where: whereClause }),
    ]);

    res.json({
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: sales,
    });
  }
);

export const getSaleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          clientCategory: true,
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
      saleDetails: {
        include: {
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
      saleCreditPayments: true,
    },
  });

  if (!sale) {
    return res.status(404).json({ message: "Venta no encontrada." });
  }

  // Buscar priceTypes utilizados en la venta (si existen)
  const priceTypeMap = await prisma.priceType.findMany({
    where: {
      id: {
        in: sale.saleDetails
          .map((d: any) => d.priceTypeId)
          .filter(Boolean) as string[],
      },
    },
    include: {
      currency: true,
    },
  });

  // Enriquecer los detalles con los datos del priceType (si aplica)
  const enrichedDetails = sale.saleDetails.map((detail: any) => {
    const priceType = priceTypeMap.find((pt) => pt.id === detail.priceTypeId);
    return {
      ...detail,
      priceType: priceType
        ? {
            id: priceType.id,
            name: priceType.name,
            marginPercent: priceType.marginPercent,
            currency: priceType.currency,
          }
        : null,
    };
  });

  // Calcular el total original (sin descuento aplicado)
  const originalTotal = enrichedDetails.reduce(
    (sum: number, detail: any) => sum + Number(detail.subtotal),
    0
  );

  res.json({
    ...sale,
    saleDetails: enrichedDetails, // Incluye manualPrice, priceType enriquecido, etc.
    originalTotal,
    total: Number(sale.total),
  });
});

export const createSaleWithStockValidation = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      saleDate,
      paymentType,
      paymentStatus,
      clientId,
      userId,
      tenantId,
      subsidiaryId,
      note,
      discountType = "PORCENTAJE",
      discountValue = 0,
      saleDetails,
    } = req.body;

    const cleanedDiscountType =
      discountType?.toString().trim().toUpperCase() === "CANTIDAD"
        ? "CANTIDAD"
        : "PORCENTAJE";

    // Validar stock disponible
    for (const item of saleDetails) {
      const inventory = await prisma.inventory.findFirst({
        where: {
          productId: item.productId,
          subsidiaryId,
        },
      });

      const available = inventory?.quantity_available || 0;
      if (available < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para el producto con ID: ${item.productId}. Disponible: ${available}, requerido: ${item.quantity}`,
        });
      }
    }

    const generatedCode = await generateNextSaleCode(
      saleDate,
      tenantId,
      subsidiaryId
    );

    const subtotal = saleDetails.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const discount =
      cleanedDiscountType === "PORCENTAJE"
        ? subtotal * (Number(discountValue) / 100)
        : Number(discountValue || 0);

    const total = subtotal - discount;

    const createdSale = await prisma.sale.create({
      data: {
        code: generatedCode,
        saleDate: new Date(saleDate),
        paymentType,
        salesStatus: "COMPLETADA",
        paymentStatus,
        note,
        discountType: cleanedDiscountType,
        discountValue,
        total,
        clientId,
        userId,
        tenantId,
        subsidiaryId,
        saleDetails: {
          create: saleDetails.map((item: any) => ({
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            productId: item.productId,
            currencyId: item.currencyId,
            priceTypeId: item.manualPrice ? null : item.priceTypeId ?? null,
            manualPrice: item.manualPrice ?? false,
            clientId,
            userId,
            tenantId,
            subsidiaryId,
          })),
        },
      },
      include: {
        saleDetails: true,
      },
    });

    for (const item of saleDetails) {
      await prisma.inventory.updateMany({
        where: {
          productId: item.productId,
          subsidiaryId,
        },
        data: {
          quantity_available: {
            decrement: item.quantity,
          },
          lastUpdateReason: StockUpdateReason.VENTA,
          lastUpdateQuantity: -item.quantity,
          userId,
        },
      });

      // Verificar si el inventario quedó en 0 y desactivar el producto
      const updatedInventory = await prisma.inventory.findFirst({
        where: {
          productId: item.productId,
          subsidiaryId,
        },
      });

      if (updatedInventory?.quantity_available === 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { status: false },
        });
      }
    }

    res.status(201).json(createdSale);
  }
);

export const createSaleAllowNegativeStock = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      saleDate,
      paymentType,
      paymentStatus,
      clientId,
      userId,
      tenantId,
      subsidiaryId,
      note,
      discountType = "PORCENTAJE",
      discountValue = 0,
      saleDetails,
    } = req.body;

    const cleanedDiscountType =
      discountType?.toString().trim().toUpperCase() === "CANTIDAD"
        ? "CANTIDAD"
        : "PORCENTAJE";

    const generatedCode = await generateNextSaleCode(
      saleDate,
      tenantId,
      subsidiaryId
    );

    const subtotal = saleDetails.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const discount =
      cleanedDiscountType === "PORCENTAJE"
        ? subtotal * (Number(discountValue) / 100)
        : Number(discountValue || 0);

    const total = subtotal - discount;

    const createdSale = await prisma.sale.create({
      data: {
        code: generatedCode,
        saleDate: new Date(saleDate),
        paymentType,
        salesStatus: "COMPLETADA",
        paymentStatus,
        note,
        discountType: cleanedDiscountType,
        discountValue,
        total,
        clientId,
        userId,
        tenantId,
        subsidiaryId,
        saleDetails: {
          create: saleDetails.map((item: any) => ({
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
            productId: item.productId,
            currencyId: item.currencyId,
            priceTypeId: item.manualPrice ? null : item.priceTypeId ?? null,
            manualPrice: item.manualPrice ?? false,
            clientId,
            userId,
            tenantId,
            subsidiaryId,
          })),
        },
      },
      include: {
        saleDetails: true,
      },
    });

    for (const item of saleDetails) {
      await prisma.inventory.upsert({
        where: {
          productId_subsidiaryId: {
            productId: item.productId,
            subsidiaryId,
          },
        },
        update: {
          quantity_available: {
            decrement: item.quantity,
          },
          lastUpdateReason: StockUpdateReason.VENTA,
          lastUpdateQuantity: -item.quantity,
          userId,
        },
        create: {
          productId: item.productId,
          subsidiaryId,
          quantity_available: -item.quantity,
          min_quantity: 0,
          lastUpdateReason: StockUpdateReason.VENTA,
          lastUpdateQuantity: -item.quantity,
          tenantId,
          userId,
        },
      });

      // Verificar si el inventario quedó en 0 y desactivar el producto
      const updatedInventory = await prisma.inventory.findFirst({
        where: {
          productId: item.productId,
          subsidiaryId,
        },
      });

      if (updatedInventory?.quantity_available === 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { status: false },
        });
      }
    }

    res.status(201).json(createdSale);
  }
);
