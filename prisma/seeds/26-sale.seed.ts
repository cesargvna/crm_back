import prisma from "../../src/utils/prisma";
import { Prisma } from "../../generated/prisma";

export async function seedSales(subsidiaries, clients, products, users) {
  console.log("🛒 Seeding Sales...");

  const createdSales: Prisma.SaleGetPayload<{ include: { saleDetails: true } }>[] = [];

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} for sales`);
      continue;
    }

    const client = clients[0];
    const user = users[0];
    const product = products[0];

    const sale = await prisma.sale.create({
      data: {
        total: 50,
        paymentType: "CONTADO",
        dispatchStatus: "COMPLETADA",
        paymentStatus: "COMPLETO",
        saleDate: new Date(),
        clientId: client.id,
        userId: user.id,
        tenantId: s.tenantId,
        subsidiaryId: s.id,
        saleDetails: {
          create: [
            {
              unit_price: 5,
              quantity: 10,
              subtotal: 50,
              productId: product.id,
              userId: user.id,
              tenantId: s.tenantId,
              subsidiaryId: s.id,
            },
          ],
        },
      },
      include: { saleDetails: true },
    });

    createdSales.push(sale);
  }

  console.log(`✅ Sales created: ${createdSales.length}`);
  return createdSales;
}
