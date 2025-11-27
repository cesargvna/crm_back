// seeds/24-inventory.seed.ts
import prisma from "../../src/utils/prisma";
import { StockUpdateReason, Inventory } from "../../generated/prisma";

type ProductLite = {
  id: string;
  name: string;
  tenantId: string;
  subsidiaryId: string;
};

type UserLite = {
  id: string;
  tenantId: string;
  subsidiaryId: string;
};

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";

export async function seedInventories(
  products: ProductLite[],
  users: UserLite[]
): Promise<Inventory[]> {
  console.log("📦 Seeding Inventories...");

  const createdInventories: Inventory[] = [];

  for (const product of products) {
    // ⏭️ Omitir tenants/subsidiarias dummy
    if (product.tenantId === FIXED_UUID || product.subsidiaryId === FIXED_UUID) {
      console.log(
        `⏭️ Skipping product ${product.id} from invalid tenant or subsidiary.`
      );
      continue;
    }

    // Busca un usuario de la misma subsidiaria
    const user =
      users.find((u) => u.subsidiaryId === product.subsidiaryId) ||
      users.find((u) => u.tenantId === product.tenantId);

    if (!user) {
      console.warn(
        `⚠️ No valid user found for subsidiary ${product.subsidiaryId}. Skipping inventory for product ${product.id}.`
      );
      continue;
    }

    // ¿Ya existe el inventario para (productId, subsidiaryId)?
    const existing = await prisma.inventory.findUnique({
      where: {
        productId_subsidiaryId: {
          productId: product.id,
          subsidiaryId: product.subsidiaryId,
        },
      },
    });

    if (existing) {
      console.log(
        `⚠️ Inventory already exists for product '${product.name}' in subsidiary ${product.subsidiaryId} (qty=${existing.quantity_available}).`
      );
      // No modificamos inventarios existentes para mantener idempotencia fuerte.
      continue;
    }

    // Crear inventario inicial
    const quantity = Math.floor(Math.random() * 90) + 10; // 10..99
    const min_quantity = Math.max(1, Math.floor(quantity * 0.2));

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

    createdInventories.push(inventory);
    console.log(
      `✅ Inventory created for product '${product.name}' in subsidiary ${product.subsidiaryId} (qty=${quantity}, min=${min_quantity}).`
    );
  }

  console.log(
    `📦 Total inventory records created: ${createdInventories.length}`
  );
  return createdInventories;
}
