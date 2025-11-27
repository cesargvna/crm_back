// prisma/seeders/07-purchase.seed.ts
import prisma from "../../src/utils/prisma";
import { faker } from "@faker-js/faker";
import { Decimal } from "@prisma/client/runtime/library";
import {
  StockUpdateReason,
  PaymentType,
  PaymentStatus,
  PurchaseStatus,
  DiscountType,
  Purchase,
} from "../../generated/prisma";
import { format } from "date-fns";
import { SeededTenant } from "./01-tenant.seed";

interface PurchaseDetailData {
  id: string;
  price: Decimal;
  quantity: number;
  subtotal: Decimal;
  productId: string;
  purchaseId: string;
  userId: string;
  supplierId: string;
  subsidiaryId: string;
  tenantId: string;
}

function marginForPriceType(name: string): number {
  const n = (name || "").toUpperCase();
  if (n.includes("MINOR")) return 30;    // MINORISTA
  if (n.includes("MAYOR")) return 15;    // MAYORISTA
  return 25;                              // default
}

export async function seedPurchases({
  tenants,
  subsidiaries,
  users,
  suppliers,
  products,
  currencies, // ← recibido pero no usado (tu schema no tiene currency en compras)
}: {
  tenants: SeededTenant[];
  subsidiaries: Array<{ id: string; tenantId: string }>;
  users: Array<{ id: string; tenantId: string; subsidiaryId: string }>;
  suppliers: Array<{ id: string; tenantId: string }>;
  products: Array<{ id: string; tenantId: string; subsidiaryId: string }>;
  currencies: any[];
}): Promise<Purchase[]> {
  console.log("🛒 Seeding purchases...");

  const FIXED_UUID = "00000000-0000-0000-0000-000000000000";
  const allPurchases: Purchase[] = [];

  for (const tenant of tenants) {
    if (tenant.id === FIXED_UUID) continue;

    const tenantSubs = subsidiaries.filter((s) => s.tenantId === tenant.id);
    const tenantUsers = users.filter((u) => u.tenantId === tenant.id);
    const tenantSuppliers = suppliers.filter((s) => s.tenantId === tenant.id);
    const tenantProducts = products.filter((p) => p.tenantId === tenant.id);

    for (const subsidiary of tenantSubs) {
      const user = tenantUsers.find((u) => u.subsidiaryId === subsidiary.id);
      const supplier = tenantSuppliers[0]; // el primero disponible
      const productsForPurchase = faker.helpers.arrayElements(
        tenantProducts.filter((p) => p.subsidiaryId === subsidiary.id),
        faker.number.int({ min: 1, max: 3 })
      );

      if (!user || !supplier || productsForPurchase.length === 0) continue;

      const purchaseDate = new Date();
      // Código único por sucursal/fecha (cumple @@unique([tenantId, subsidiaryId, code]))
      const code = `${format(purchaseDate, "yyyy-MM-dd")}-${faker
        .number
        .int({ min: 1, max: 99999 })
        .toString()
        .padStart(5, "0")}`; // <= 20 chars

      let total = new Decimal(0);
      const details: PurchaseDetailData[] = [];

      for (const product of productsForPurchase) {
        const quantity = faker.number.int({ min: 1, max: 20 });
        const price = new Decimal(Number(faker.number.float({ min: 2, max: 15 }).toFixed(2)));
        const subtotal = price.mul(quantity);
        total = total.add(subtotal);

        details.push({
          id: faker.string.uuid(),
          price,
          quantity,
          subtotal,
          productId: product.id,
          purchaseId: "", // se setea luego
          userId: user.id,
          supplierId: supplier.id,
          subsidiaryId: subsidiary.id,
          tenantId: tenant.id,
        });
      }

      // Crear la compra principal
      const purchase = await prisma.purchase.create({
        data: {
          code,
          discountType: DiscountType.CANTIDAD,
          discountValue: new Decimal(0),
          total,
          note: faker.lorem.sentence(),
          purchaseDate,
          paymentType: PaymentType.CONTADO,
          purchaseStatus: PurchaseStatus.CONFIRMADA,
          paymentStatus: PaymentStatus.COMPLETO,
          supplierId: supplier.id,
          userId: user.id,
          subsidiaryId: subsidiary.id,
          tenantId: tenant.id,
        },
      });

      // Detalles + inventario + precios
      for (const detail of details) {
        detail.purchaseId = purchase.id;

        await prisma.purchaseDetail.create({
          data: {
            id: detail.id,
            price: detail.price,
            quantity: detail.quantity,
            subtotal: detail.subtotal,
            productId: detail.productId,
            purchaseId: detail.purchaseId,
            userId: detail.userId,
            supplierId: detail.supplierId,
            subsidiaryId: detail.subsidiaryId,
            tenantId: detail.tenantId,
          },
        });

        // Inventario: actualizar o crear
        const existingInventory = await prisma.inventory.findUnique({
          where: {
            productId_subsidiaryId: {
              productId: detail.productId,
              subsidiaryId: detail.subsidiaryId,
            },
          },
        });

        if (existingInventory) {
          await prisma.inventory.update({
            where: {
              productId_subsidiaryId: {
                productId: detail.productId,
                subsidiaryId: detail.subsidiaryId,
              },
            },
            data: {
              quantity_available: existingInventory.quantity_available + detail.quantity,
              lastUpdateReason: StockUpdateReason.COMPRA,
              lastUpdateQuantity: detail.quantity,
              userId: detail.userId,
            },
          });
        } else {
          await prisma.inventory.create({
            data: {
              quantity_available: detail.quantity,
              min_quantity: 10,
              lastUpdateReason: StockUpdateReason.COMPRA,
              lastUpdateQuantity: detail.quantity,
              productId: detail.productId,
              userId: detail.userId,
              subsidiaryId: detail.subsidiaryId,
              tenantId: detail.tenantId,
            },
          });
        }

        // ProductPrice: crear/actualizar por PriceType activo en esa sucursal
        const priceTypes = await prisma.priceType.findMany({
          where: {
            tenantId: detail.tenantId,
            subsidiaryId: detail.subsidiaryId,
            status: true,
          },
        });

        for (const priceType of priceTypes) {
          const margin = marginForPriceType(priceType.name); // %
          const venta = detail.price.toNumber() * (1 + margin / 100);

          const key = {
            productId_priceTypeId_subsidiaryId: {
              productId: detail.productId,
              priceTypeId: priceType.id,
              subsidiaryId: detail.subsidiaryId,
            },
          };

          const existingPrice = await prisma.productPrice.findUnique({ where: key });

          if (existingPrice) {
            await prisma.productPrice.update({
              where: key,
              data: {
                price: new Decimal(venta.toFixed(2)),
                baseCostUsed: detail.price,
                marginPercent: new Decimal(margin.toFixed(2)),
              },
            });
          } else {
            await prisma.productPrice.create({
              data: {
                price: new Decimal(venta.toFixed(2)),
                baseCostUsed: detail.price,
                marginPercent: new Decimal(margin.toFixed(2)),
                productId: detail.productId,
                priceTypeId: priceType.id,
                tenantId: detail.tenantId,
                subsidiaryId: detail.subsidiaryId,
              },
            });
          }
        }
      }

      allPurchases.push(purchase);
      console.log(`✅ Compra ${purchase.code} creada con ${details.length} productos.`);
    }
  }

  return allPurchases;
}
