import prisma from "../../src/utils/prisma";
import { Prisma } from "../../generated/prisma";

export async function seedCreditPayments(sales) {
  console.log("💳 Seeding SaleCreditPayments...");

  type CreditPaymentType = Prisma.SaleCreditPaymentGetPayload<{}>;

  const createdPayments: CreditPaymentType[] = [];

  for (const sale of sales) {
    const payment = await prisma.saleCreditPayment.create({
      data: {
        saleId: sale.id,
        amount: 50,
        paymentDate: new Date(),
        tenantId: sale.tenantId,
        subsidiaryId: sale.subsidiaryId,
      },
    });

    createdPayments.push(payment);
  }

  return createdPayments;
}
