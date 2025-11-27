// src/controllers/purchase/purchaseCreditPayment.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { PaymentStatus, PaymentType } from "../../../generated/prisma";

export const createPurchaseCreditPayment = asyncHandler(async (req: Request, res: Response) => {
  const { purchaseId } = req.params;
  const {
    amount,
    paymentDate,
    supplierId,
    userId,
    tenantId,
    subsidiaryId,
    cashSessionId,
    paymentType: overridePaymentType // opcional
  } = req.body;

  if (!purchaseId) return res.status(400).json({ message: "purchaseId es requerido" });

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ message: "El monto debe ser mayor a 0" });
  }
  if (!paymentDate) return res.status(400).json({ message: "paymentDate es requerido" });
  if (!supplierId || !userId || !tenantId || !subsidiaryId) {
    return res.status(400).json({ message: "supplierId, userId, tenantId y subsidiaryId son requeridos" });
  }

  const result = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      select: {
        id: true,
        code: true,
        total: true,
        supplierId: true,
        tenantId: true,
        subsidiaryId: true,
        paymentType: true,
        paymentStatus: true
      },
    });

    if (!purchase) throw new Error("Compra no encontrada");

    // Validar tenant / sucursal / proveedor
    if (purchase.tenantId !== tenantId || purchase.subsidiaryId !== subsidiaryId) {
      throw new Error("La compra no pertenece al tenant/subsidiary indicado");
    }
    if (purchase.supplierId !== supplierId) {
      throw new Error("El supplierId no coincide con la compra");
    }

    // Actualizar tipo de pago si se envía diferente
    let effectivePaymentType: PaymentType = purchase.paymentType;
    if (overridePaymentType && overridePaymentType !== purchase.paymentType) {
      if (!["CONTADO", "CREDITO"].includes(overridePaymentType)) {
        throw new Error("paymentType inválido. Use CONTADO o CREDITO.");
      }
      effectivePaymentType = overridePaymentType;
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { paymentType: effectivePaymentType },
      });
    }

    // Pagos acumulados
    const paidAgg = await tx.purchaseCreditPayment.aggregate({
      where: { purchaseId: purchase.id },
      _sum: { amount: true },
    });

    const total = Number(purchase.total);
    const paidBefore = Number(paidAgg._sum.amount || 0);
    const remainingBefore = Math.max(0, total - paidBefore);

    // Reglas de validación
    if (effectivePaymentType === "CONTADO") {
      if (numericAmount !== remainingBefore) {
        throw new Error(
          `Para CONTADO debe pagarse el saldo exacto. Saldo actual: ${remainingBefore.toFixed(2)}`
        );
      }
    } else {
      if (numericAmount > remainingBefore) {
        throw new Error(
          `El monto supera el saldo. Saldo actual: ${remainingBefore.toFixed(2)}`
        );
      }
    }

    // Crear pago
    const created = await tx.purchaseCreditPayment.create({
      data: {
        purchaseId: purchase.id,
        amount: numericAmount,
        paymentDate: new Date(paymentDate),
        supplierId,
        userId,
        tenantId,
        subsidiaryId,
        cashSessionId: cashSessionId || null,
      },
    });

    const paidAfter = paidBefore + numericAmount;
    const remainingAfter = Math.max(0, total - paidAfter);

    // Determinar nuevo estado
    let newStatus: PaymentStatus = "PENDIENTE";
    if (paidAfter <= 0) newStatus = "PENDIENTE";
    else if (paidAfter >= total) newStatus = "COMPLETO";
    else newStatus = "PARCIAL";

    if (newStatus !== purchase.paymentStatus) {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { paymentStatus: newStatus },
      });
    }

    return {
      payment: created,
      purchase: {
        id: purchase.id,
        code: purchase.code,
        paymentType: effectivePaymentType,
        paymentStatus: newStatus,
        total,
        paidBefore,
        paidAfter,
        remainingBefore,
        remainingAfter,
      },
    };
  });

  res.status(201).json(result);
});