import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { StockUpdateReason, PurchaseStatus } from "../../../generated/prisma";
import { PaymentType, PaymentStatus } from "../../../generated/prisma";

export const createPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      purchaseDate, // ← new
      total,
      note,
      paymentType,
      purchaseStatus,
      paymentStatus,
      supplierId,
      userId,
      tenantId,
      subsidiaryId,
      purchaseDetails,
    } = req.body;

    const BASE_CURRENCY = "USD";

    if (!purchaseDate) {
      return res.status(400).json({ message: "Purchase date is required." });
    }

    const parsedPurchaseDate = new Date(`${purchaseDate}T00:00:00`);
    if (isNaN(parsedPurchaseDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    if (!Array.isArray(purchaseDetails) || purchaseDetails.length === 0) {
      return res
        .status(400)
        .json({ message: "Purchase details are required." });
    }

    // ✅ Validate enums
    const validPaymentType = paymentType.toUpperCase();
    const validPurchaseStatus = purchaseStatus.toUpperCase();
    const validPaymentStatus = paymentStatus.toUpperCase();

    if (!Object.values(PaymentType).includes(validPaymentType as PaymentType)) {
      return res
        .status(400)
        .json({ message: `Invalid paymentType: ${paymentType}` });
    }
    if (
      !Object.values(PurchaseStatus).includes(
        validPurchaseStatus as PurchaseStatus
      )
    ) {
      return res
        .status(400)
        .json({ message: `Invalid purchaseStatus: ${purchaseStatus}` });
    }
    if (
      !Object.values(PaymentStatus).includes(
        validPaymentStatus as PaymentStatus
      )
    ) {
      return res
        .status(400)
        .json({ message: `Invalid paymentStatus: ${paymentStatus}` });
    }

    // 🔢 Generate code like YYYY-MM-DD-00001
    const countToday = await prisma.purchase.count({
      where: {
        purchaseDate: parsedPurchaseDate,
        subsidiaryId,
      },
    });

    const datePrefix = purchaseDate;
    const correlativo = String(countToday + 1).padStart(5, "0");
    const code = `${datePrefix}-${correlativo}`;

    // 1️⃣ Create the main purchase
    const purchase = await prisma.purchase.create({
      data: {
        code,
        purchaseDate: parsedPurchaseDate,
        total,
        note,
        paymentType: validPaymentType as PaymentType,
        purchaseStatus: validPurchaseStatus as PurchaseStatus,
        paymentStatus: validPaymentStatus as PaymentStatus,
        supplierId,
        userId,
        tenantId,
        subsidiaryId,
      },
    });

    // 2️⃣ Get active currencies other than USD
    const currencies = await prisma.currency.findMany({
      where: {
        code: { not: BASE_CURRENCY },
        status: true,
        subsidiaryId,
      },
    });

    // 3️⃣ Get active price types
    const priceTypes = await prisma.priceType.findMany({
      where: {
        status: true,
        subsidiaryId,
      },
    });

    // 4️⃣ Process each detail
    for (const detail of purchaseDetails) {
      const { productId, quantity, unit_price, sub_total } = detail;

      const createdDetail = await prisma.purchaseDetail.create({
        data: {
          purchaseId: purchase.id,
          productId,
          quantity,
          unit_price,
          sub_total,
          supplierId,
          userId,
          tenantId,
          subsidiaryId,
        },
      });

      for (const currency of currencies) {
        const exchangeRate = await prisma.exchangeRate.findFirst({
          where: {
            fromCurrency: { code: BASE_CURRENCY },
            toCurrencyId: currency.id,
            subsidiaryId,
          },
          orderBy: { created_at: "desc" },
        });

        if (!exchangeRate) {
          console.warn(`⚠️ No exchange rate for USD → ${currency.code}`);
          continue;
        }

        const rate = Number(exchangeRate.rate);
        const convertedUnitPrice = Number(unit_price) * rate;
        const convertedSubtotal = Number(sub_total) * rate;

        await prisma.purchasePriceInCurrency.create({
          data: {
            purchaseDetailId: createdDetail.id,
            currencyId: currency.id,
            exchangeRate: rate,
            unitPrice: convertedUnitPrice,
            subTotal: convertedSubtotal,
            tenantId,
            subsidiaryId,
          },
        });

        for (const priceType of priceTypes) {
          const margin = Number(priceType.marginPercent);
          const salePrice = convertedUnitPrice * (1 + margin / 100);

          await prisma.productPrice.upsert({
            where: {
              productId_priceTypeId_currencyId_subsidiaryId: {
                productId,
                priceTypeId: priceType.id,
                currencyId: currency.id,
                subsidiaryId,
              },
            },
            update: {
              amount: salePrice,
              autoGenerated: true,
            },
            create: {
              productId,
              priceTypeId: priceType.id,
              currencyId: currency.id,
              amount: salePrice,
              autoGenerated: true,
              tenantId,
              subsidiaryId,
            },
          });
        }
      }

      await prisma.inventory.upsert({
        where: {
          productId_subsidiaryId: { productId, subsidiaryId },
        },
        update: {
          quantity_available: { increment: quantity },
          lastUpdateQuantity: quantity,
          lastUpdateReason: StockUpdateReason.COMPRA,
          userId,
        },
        create: {
          productId,
          quantity_available: quantity,
          min_quantity: 0,
          lastUpdateQuantity: quantity,
          lastUpdateReason: StockUpdateReason.COMPRA,
          userId,
          tenantId,
          subsidiaryId,
        },
      });

      if (validPurchaseStatus === "CONFIRMADA") {
        await prisma.product.update({
          where: { id: productId },
          data: {
            lastPurchasePriceUSD: unit_price,
            lastPurchaseDate: new Date(),
          },
        });
      }
    }

    // 5️⃣ Return full purchase info
    const completePurchase = await prisma.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        supplier: true,
        user: true,
        purchaseDetails: {
          include: {
            product: true,
            pricesInCurrency: {
              include: {
                currency: true,
              },
            },
          },
        },
        creditPayments: true,
      },
    });

    return res.status(201).json({
      message: "Purchase created successfully",
      data: completePurchase,
    });
  }
);

export const getPurchaseById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: true,
        purchaseDetails: {
          include: {
            product: true,
            pricesInCurrency: {
              include: {
                currency: true,
              },
            },
          },
        },
        creditPayments: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    return res.status(200).json({
      message: "Purchase retrieved successfully",
      data: purchase,
    });
  }
);

export const getPurchasesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      page = "1",
      limit = "5",
      status,
      paymentStatus,
      paymentType,
      supplierId,
      userId,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filters: any = {
      subsidiaryId,
    };

    if (status) filters.purchaseStatus = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (paymentType) filters.paymentType = paymentType;
    if (supplierId) filters.supplierId = supplierId;
    if (userId) filters.userId = userId;
    if (startDate && endDate) {
      filters.purchaseDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (search) {
      filters.OR = [
        {
          note: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          supplier: {
            name: {
              contains: search as string,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [total, purchases] = await Promise.all([
      prisma.purchase.count({ where: filters }),
      prisma.purchase.findMany({
        where: filters,
        orderBy: { purchaseDate: "desc" },
        skip,
        take: limitNumber,
        include: {
          supplier: true,
          user: true,
          purchaseDetails: {
            include: {
              product: true,
              pricesInCurrency: {
                include: {
                  currency: true,
                },
              },
            },
          },
          creditPayments: true,
        },
      }),
    ]);

    return res.status(200).json({
      message: "Purchases retrieved successfully",
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      purchases,
    });
  }
);
