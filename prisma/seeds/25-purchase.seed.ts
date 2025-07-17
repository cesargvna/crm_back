import prisma from "../../src/utils/prisma";
import { Prisma } from "../../generated/prisma";

export async function seedPurchases(subsidiaries, suppliers, products, users) {
  console.log("📦 Seeding Purchases...");

  const createdPurchases: Prisma.PurchaseGetPayload<{ include: { purchaseDetails: true } }>[] = [];

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} for purchases`);
      continue;
    }

    const supplier = suppliers.find(sup => sup.subsidiaryId === s.id);
    const user = users.find(u => u.subsidiaryId === s.id);
    const product = products.find(p => p.subsidiaryId === s.id);

    if (!supplier || !user || !product) {
      console.warn(`⚠️ Missing data for subsidiary ${s.id}`);
      continue;
    }

    const purchase = await prisma.purchase.create({
      data: {
        total: 100,
        paymentType: "CONTADO",
        purchaseStatus: "CONFIRMADA",
        paymentStatus: "COMPLETO",
        note: "Compra inicial",
        purchaseDate: new Date(),
        supplierId: supplier.id,
        userId: user.id,
        tenantId: s.tenantId,
        subsidiaryId: s.id,
        purchaseDetails: {
          create: [
            {
              unit_price: 10,
              quantity: 10,
              sub_total: 100,
              productId: product.id,
              supplierId: supplier.id,
              userId: user.id,
              tenantId: s.tenantId,
              subsidiaryId: s.id,
            },
          ],
        },
      },
      include: { purchaseDetails: true },
    });

    createdPurchases.push(purchase);
  }

  console.log(`✅ Purchases created: ${createdPurchases.length}`);
  return createdPurchases;
}