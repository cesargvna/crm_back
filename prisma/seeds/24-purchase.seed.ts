import prisma from "../../src/utils/prisma";
import { faker } from "@faker-js/faker";
import { Decimal } from "@prisma/client/runtime/library";
import {
  StockUpdateReason,
  PaymentType,
  DispatchStatus,
  PaymentStatus,
} from "../../generated/prisma";
import { format } from "date-fns";
import { SeededTenant } from "./01-tenant.seed";
import { Purchase } from "../../generated/prisma";

interface PurchaseDetailData {
  id: string;
  price: Decimal;
  quantity: number;
  sub_total: Decimal;
  productId: string;
  purchaseId: string;
  userId: string;
  supplierId: string;
  currencyId: string;
  subsidiaryId: string;
  tenantId: string;
}

export async function seedPurchases({
  tenants,
  subsidiaries,
  users,
  suppliers,
  products,
  currencies,
}: {
  tenants: SeededTenant[];
  subsidiaries: any[];
  users: any[];
  suppliers: any[];
  products: any[];
  currencies: any[];
}) {
  console.log("🛒 Seeding purchases...");

  const purchases = [];

  for (const tenant of tenants) {
    if (tenant.id === "00000000-0000-0000-0000-000000000000") continue;

    const tenantSubs = subsidiaries.filter((s) => s.tenantId === tenant.id);
    const tenantUsers = users.filter((u) => u.tenantId === tenant.id);
    const tenantSuppliers = suppliers.filter((s) => s.tenantId === tenant.id);
    const tenantProducts = products.filter((p) => p.tenantId === tenant.id);
    const tenantCurrencies = currencies.filter((c) => c.tenantId === tenant.id);

    for (const subsidiary of tenantSubs) {
      const user = tenantUsers.find((u) => u.subsidiaryId === subsidiary.id);
      const supplier = tenantSuppliers[0]; // el primero disponible
      const currency = tenantCurrencies.find((c) => c.subsidiaryId === subsidiary.id);
      const productsForPurchase = faker.helpers.arrayElements(
        tenantProducts.filter((p) => p.subsidiaryId === subsidiary.id),
        faker.number.int({ min: 1, max: 3 })
      );

      if (!user || !supplier || !currency || productsForPurchase.length === 0) continue;

      const purchaseDate = new Date();
      const code = `${format(purchaseDate, "yyyy-MM-dd")}-${faker
        .number
        .int({ min: 1, max: 99999 })
        .toString()
        .padStart(5, "0")}`;

      let total = new Decimal(0);
      const details: PurchaseDetailData[] = [];

      for (const product of productsForPurchase) {
        const quantity = faker.number.int({ min: 1, max: 20 });
        const price = new Decimal(Number(faker.number.float({ min: 2, max: 15 }).toFixed(2)));
        const sub_total = price.mul(quantity);

        total = total.add(sub_total);

        details.push({
          id: faker.string.uuid(),
          price,
          quantity,
          sub_total,
          productId: product.id,
          purchaseId: "",
          userId: user.id,
          supplierId: supplier.id,
          currencyId: currency.id,
          subsidiaryId: subsidiary.id,
          tenantId: tenant.id,
        });
      }

      const purchase = await prisma.purchase.create({
        data: {
          code,
          total,
          note: faker.lorem.sentence(),
          purchaseDate,
          paymentType: PaymentType.CONTADO,
          dispatchStatus: DispatchStatus.COMPLETADA,
          paymentStatus: PaymentStatus.COMPLETO,
          supplierId: supplier.id,
          userId: user.id,
          subsidiaryId: subsidiary.id,
          tenantId: tenant.id,
        },
      });

      const purchases: Purchase[] = []; 

      for (const detail of details) {
        detail.purchaseId = purchase.id;

        await prisma.purchaseDetail.create({ data: detail });

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

        // 🔁 Actualizar o crear precios de venta por PriceType
        const priceTypes = await prisma.priceType.findMany({
          where: {
            tenantId: detail.tenantId,
            subsidiaryId: detail.subsidiaryId,
            status: true,
          },
        });

        for (const priceType of priceTypes) {
          const margin = priceType.marginPercent.toNumber();
          const venta = detail.price.toNumber() * (1 + margin / 100);

          const existingPrice = await prisma.productPrice.findUnique({
            where: {
              productId_priceTypeId_subsidiaryId: {
                productId: detail.productId,
                priceTypeId: priceType.id,
                subsidiaryId: detail.subsidiaryId,
              },
            },
          });

          if (existingPrice) {
            if (existingPrice.autoGenerated) {
              await prisma.productPrice.update({
                where: {
                  productId_priceTypeId_subsidiaryId: {
                    productId: detail.productId,
                    priceTypeId: priceType.id,
                    subsidiaryId: detail.subsidiaryId,
                  },
                },
                data: {
                  price: new Decimal(venta.toFixed(2)),
                },
              });
            }
          } else {
            await prisma.productPrice.create({
              data: {
                price: new Decimal(venta.toFixed(2)),
                autoGenerated: true,
                editable: false,
                productId: detail.productId,
                priceTypeId: priceType.id,
                tenantId: detail.tenantId,
                subsidiaryId: detail.subsidiaryId,
              },
            });
          }
        }
      }

      console.log(`✅ Compra ${purchase.code} creada con ${details.length} productos.`);
    }
  }

  return purchases;
}
