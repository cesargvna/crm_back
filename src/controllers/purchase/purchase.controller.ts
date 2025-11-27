// src/controllers/purchase/purchase.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  PaymentType,
  PaymentStatus,
  PurchaseStatus,
  DiscountType,
  Prisma,
} from "../../../generated/prisma";
import { generateNextPurchaseCode } from "../../utils/generateNextPurchaseCode";

// Redondeo duro a 2 decimales (Bolivia)
const to2 = (n: number) => Number((Math.round(n * 100) / 100).toFixed(2));

/**
 * Helper de reintento para evitar colisión del code (P2002).
 * Lee el último correlativo y reintenta hasta 5 veces si colisiona.
 */
async function createPurchaseWithCodeRetry(
  body: any,
  fnTx: (code: string) => Promise<any>,
  maxRetries = 5
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    const code = await generateNextPurchaseCode(
      body.purchaseDate,
      body.tenantId,
      body.subsidiaryId
    );
    try {
      return await fnTx(code);
    } catch (err: any) {
      // Unique constraint violation
      if (
        err?.code === "P2002" &&
        Array.isArray(err?.meta?.target) &&
        err.meta.target.includes("code")
      ) {
        attempt++;
        continue; // genera otro code y reintenta
      }
      throw err; // otro error: propaga
    }
  }
  throw new Error(
    "No se pudo generar un código único de compra tras varios intentos."
  );
}

/** CREATE ÚNICO con precios manuales + márgenes calculados + retry de code */
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const {
    purchaseDate,
    paymentType,
    paymentStatus,
    supplierId,
    userId,
    tenantId,
    subsidiaryId,
    note,
    purchaseDetails,
    cashSessionId,
    discountType = "PORCENTAJE",
    discountValue = 0,
  } = req.body;

  const cleanedDiscountType: DiscountType =
    (discountType?.toString().trim().toUpperCase() === "CANTIDAD"
      ? "CANTIDAD"
      : "PORCENTAJE") as DiscountType;

  // Subtotal y descuentos (2 decimales)
  const subtotal = to2(
    purchaseDetails.reduce(
      (sum: number, it: any) => sum + Number(it.price) * Number(it.quantity),
      0
    )
  );

  const rawDiscount =
    cleanedDiscountType === "PORCENTAJE"
      ? subtotal * (Number(discountValue) / 100)
      : Number(discountValue || 0);

  const discount = to2(Math.max(0, Math.min(subtotal, rawDiscount)));
  const total = to2(subtotal - discount);

  // Cálculos a devolver por detalle
  type SalePriceComputed = {
    priceTypeId: string;
    priceTypeName: string;
    baseCostUsed: number | null;
    salePrice: number;
    gainAmount: number | null;
    gainPercent: number | null;
  };
  const computedByProduct: Record<string, SalePriceComputed[]> = {};

  try {
    const created = await createPurchaseWithCodeRetry(req.body, async (code) => {
      return prisma.$transaction(async (tx) => {
        // 1) Crear cabecera de compra
        const purchase = await tx.purchase.create({
          data: {
            code,
            purchaseDate: new Date(purchaseDate),
            paymentType,
            purchaseStatus: "CONFIRMADA",
            paymentStatus,
            note,
            discountType: cleanedDiscountType,
            discountValue: new Prisma.Decimal(
              to2(Number(discountValue || 0)).toFixed(2)
            ),
            supplierId,
            userId,
            tenantId,
            subsidiaryId,
            cashSessionId: cashSessionId || null,
            total: new Prisma.Decimal(total.toFixed(2)),
          },
        });

        // 2) Procesar detalles
        for (const d of purchaseDetails) {
          const productId: string = d.productId;
          const unitCost = to2(Number(d.price)); // costo unitario
          const qty = Number(d.quantity);
          const lineSubtotal = to2(unitCost * qty);
          const currencyId: string = d.currencyId;

          // 2.1) detalle de compra
          await tx.purchaseDetail.create({
            data: {
              price: new Prisma.Decimal(unitCost.toFixed(2)),
              quantity: qty,
              sub_total: new Prisma.Decimal(lineSubtotal.toFixed(2)),
              productId,
              purchaseId: purchase.id,
              userId,
              supplierId,
              currencyId,
              tenantId,
              subsidiaryId,
              cashSessionId: cashSessionId || null,
            },
          });

          // 2.2) inventario solo si entra física
          if (qty > 0) {
            const inv = await tx.inventory.findUnique({
              where: { productId_subsidiaryId: { productId, subsidiaryId } },
            });
            if (inv) {
              await tx.inventory.update({
                where: { id: inv.id },
                data: {
                  quantity_available: inv.quantity_available + qty,
                  lastUpdateReason: "COMPRA",
                  lastUpdateQuantity: qty,
                  userId,
                },
              });
            } else {
              await tx.inventory.create({
                data: {
                  productId,
                  quantity_available: qty,
                  min_quantity: 0,
                  lastUpdateReason: "COMPRA",
                  lastUpdateQuantity: qty,
                  userId,
                  tenantId,
                  subsidiaryId,
                },
              });
            }

            // 2.3) activar producto y categoría si estaban inactivos
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (product && !product.status) {
              await tx.product.update({ where: { id: productId }, data: { status: true } });
            }
            if (product?.productCategoryId) {
              const category = await tx.productCategory.findUnique({
                where: { id: product.productCategoryId },
              });
              if (category && !category.status) {
                await tx.productCategory.update({
                  where: { id: category.id },
                  data: { status: true },
                });
              }
            }
          }

          // 2.4) upsert de precios de venta manuales + cálculo de margen
          if (Array.isArray(d.salePrices) && d.salePrices.length > 0) {
            // baseCost: el costo del detalle; si 0 y qty=0, usar último costo conocido
            let baseCost = unitCost;
            if ((isNaN(baseCost) || baseCost === 0) && qty === 0) {
              const last = await tx.purchaseDetail.findFirst({
                where: { productId, tenantId, subsidiaryId },
                orderBy: { created_at: "desc" },
                select: { price: true },
              });
              baseCost = to2(last ? Number(last.price) : 0);
            }

            const computedList: SalePriceComputed[] = [];

            for (const sp of d.salePrices) {
              const salePrice = to2(Number(sp.price));
              // PriceType válido y activo del mismo tenant/sucursal
              const pt = await tx.priceType.findFirst({
                where: { id: sp.priceTypeId, tenantId, subsidiaryId, status: true },
                select: { id: true, name: true },
              });
              if (!pt) continue;

              const gainPercent =
                baseCost > 0 ? to2(((salePrice - baseCost) / baseCost) * 100) : null;
              const gainAmount =
                baseCost > 0 ? to2(salePrice - baseCost) : null;

              // persistimos ProductPrice (con 2 decimales)
              await tx.productPrice.upsert({
                where: {
                  productId_priceTypeId_subsidiaryId: {
                    productId,
                    priceTypeId: pt.id,
                    subsidiaryId,
                  },
                },
                create: {
                  id: crypto.randomUUID(),
                  productId,
                  priceTypeId: pt.id,
                  tenantId,
                  subsidiaryId,
                  price: new Prisma.Decimal(salePrice.toFixed(2)),
                  marginPercent: gainPercent === null ? null : new Prisma.Decimal(gainPercent.toFixed(2)),
                  baseCostUsed: baseCost === 0 ? null : new Prisma.Decimal(baseCost.toFixed(2)),
                },
                update: {
                  price: new Prisma.Decimal(salePrice.toFixed(2)),
                  marginPercent: gainPercent === null ? null : new Prisma.Decimal(gainPercent.toFixed(2)),
                  baseCostUsed: baseCost === 0 ? null : new Prisma.Decimal(baseCost.toFixed(2)),
                },
              });

              // guardamos cálculo para la respuesta
              computedList.push({
                priceTypeId: pt.id,
                priceTypeName: pt.name,
                baseCostUsed: baseCost === 0 ? null : baseCost,
                salePrice,
                gainAmount,
                gainPercent,
              });
            }

            if (computedList.length) {
              computedByProduct[productId] = (computedByProduct[productId] || []).concat(computedList);
            }
          }
        }

        // 3) respuesta: compra completa
        const full = await tx.purchase.findUnique({
          where: { id: purchase.id },
          include: {
            supplier: { include: { supplierCategory: true } },
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
                cashSessionId: true,
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
        });

        // 4) Adjuntar cálculos a cada detalle en 'computed'
        const enriched = {
          ...full!,
          computed: full!.purchaseDetails.map((pd) => ({
            purchaseDetailId: pd.id,
            productId: pd.product.id,
            productName: pd.product.name,
            salePrices: computedByProduct[pd.product.id] || [], // puede venir vacío si no se mandaron salePrices
          })),
        };

        return enriched;
      });
    });

    return res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "P2002") {
      // devolvemos qué índice único falló, para diagnosticar rápido
      return res.status(409).json({
        error: "Duplicate key error",
        target: err.meta?.target, // p.ej. ["tenantId","subsidiaryId","code"] o ["productId","priceTypeId","subsidiaryId"]
      });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});