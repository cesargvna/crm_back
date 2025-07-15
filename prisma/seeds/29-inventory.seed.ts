import prisma from "../../src/utils/prisma";
import { Prisma } from "../../generated/prisma";

export async function seedInventory(subsidiaries, products, users) {
  console.log("📦 Seeding Inventory...");

  type InventoryType = Prisma.InventoryGetPayload<{}>;
  const createdInventories: InventoryType[] = [];

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} for inventory`);
      continue;
    }

    for (const product of products) {
      const user = users[0];

      const inventory = await prisma.inventory.create({
        data: {
          productId: product.id,
          quantity_available: 100,
          min_quantity: 5,
          lastUpdateReason: "AJUSTE",
          lastUpdateQuantity: 100,
          userId: user.id,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      });

      createdInventories.push(inventory);
    }
  }

  console.log(`✅ Inventories created: ${createdInventories.length}`);
  return createdInventories;
}
