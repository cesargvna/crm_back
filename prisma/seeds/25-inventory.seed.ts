// seeds/24-inventory.seed.ts
import prisma from "../../src/utils/prisma";
import { StockUpdateReason, Inventory } from "../../generated/prisma";

export async function seedInventories(products, users) {
  console.log("📦 Seeding Inventories...");

  const createdInventories: Inventory[] = []; // ✅ Tipado explícito

  for (const product of products) {
    if (
      product.tenantId === "00000000-0000-0000-0000-000000000000" ||
      product.subsidiaryId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping product ${product.id} from invalid tenant or subsidiary.`);
      continue;
    }

    const user = users.find((u) => u.subsidiaryId === product.subsidiaryId);
    if (!user) {
      console.warn(`⚠️ No valid user found for subsidiary ${product.subsidiaryId}. Skipping inventory.`);
      continue;
    }

    const quantity = Math.floor(Math.random() * 90) + 10;
    const min_quantity = Math.floor(quantity * 0.2);

    const inventory = await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity_available: quantity,
        min_quantity,
        lastUpdateReason: StockUpdateReason.COMPRA,
        lastUpdateQuantity: quantity,
        userId: user.id,
        tenantId: product.tenantId,
        subsidiaryId: product.subsidiaryId,
      },
    });

    createdInventories.push(inventory); // 👈 Ahora no dará error
    console.log(`✅ Inventory created for product '${product.name}' in subsidiary ${product.subsidiaryId}`);
  }

  console.log(`📦 Total inventory records created: ${createdInventories.length}`);
  return createdInventories;
}