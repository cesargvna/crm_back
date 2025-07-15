import prisma from "../../src/utils/prisma";
import { PurchaseCreditPayment } from "../../generated/prisma";

export async function seedPurchaseCreditPayments(purchases) {
  console.log("💳 Seeding PurchaseCreditPayments...");

  const createdPayments: PurchaseCreditPayment[] = [];

  for (const purchase of purchases) {
    const payment = await prisma.purchaseCreditPayment.create({
      data: {
        purchaseId: purchase.id,
        amount: 100,
        paymentDate: new Date(),
        tenantId: purchase.tenantId,
        subsidiaryId: purchase.subsidiaryId,
      },
    });

    createdPayments.push(payment);
  }

  return createdPayments;
}
