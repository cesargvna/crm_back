import { faker } from '@faker-js/faker';
import prisma from '../../src/utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import {
  PaymentType,
  PaymentStatus,
  PurchaseStatus,
  Purchase,
  PurchaseDetail,
  PurchasePriceInCurrency,
  Tenant,
  Subsidiary,
  User,
  Supplier,
  Product,
  Currency
} from '../../generated/prisma';

export async function seedPurchases({
  tenants,
  subsidiaries,
  users,
  suppliers,
  products,
  currencies,
}: {
  tenants: Tenant[];
  subsidiaries: Subsidiary[];
  users: User[];
  suppliers: Supplier[];
  products: Product[];
  currencies: Currency[];
}) {
  console.log('🛒 Seeding purchases...');

  const purchases: Purchase[] = [];
  const details: PurchaseDetail[] = [];
  const prices: PurchasePriceInCurrency[] = [];

  for (const tenant of tenants) {
    const tenantSubs = subsidiaries.filter((s) => s.tenantId === tenant.id);

    for (const subsidiary of tenantSubs) {
      const user = users.find((u) => u.tenantId === tenant.id && u.subsidiaryId === subsidiary.id);
      const supplier = suppliers.find((s) => s.tenantId === tenant.id && s.subsidiaryId === subsidiary.id);
      const tenantProducts = products.filter((p) => p.tenantId === tenant.id && p.subsidiaryId === subsidiary.id);

      if (
        tenant.id === '00000000-0000-0000-0000-000000000000' ||
        subsidiary.id === '00000000-0000-0000-0000-000000000000' ||
        !user || !supplier || tenantProducts.length === 0
      ) {
        continue;
      }

      for (let i = 0; i < 3; i++) {
        const product = faker.helpers.arrayElement(tenantProducts);
        const unitPrice = new Decimal(faker.number.float({ min: 3, max: 40, fractionDigits: 2 }));
        const quantity = faker.number.int({ min: 1, max: 10 });
        const subTotal = unitPrice.mul(quantity);

        const purchase = await prisma.purchase.create({
          data: {
            id: faker.string.uuid(),
            purchaseDate: faker.date.recent(),
            paymentType: PaymentType.CONTADO,
            purchaseStatus: PurchaseStatus.CONFIRMADA,
            paymentStatus: PaymentStatus.COMPLETO,
            note: faker.lorem.sentence(),
            total: subTotal,
            supplierId: supplier.id,
            userId: user.id,
            tenantId: tenant.id,
            subsidiaryId: subsidiary.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        purchases.push(purchase);

        const purchaseDetail = await prisma.purchaseDetail.create({
          data: {
            id: faker.string.uuid(),
            created_at: new Date(),
            updated_at: new Date(),
            tenantId: tenant.id,
            subsidiaryId: subsidiary.id,
            supplierId: supplier.id,
            userId: user.id,
            unit_price: unitPrice,
            quantity,
            sub_total: subTotal,
            productId: product.id,
            purchaseId: purchase.id,
          },
        });
        details.push(purchaseDetail);

        for (const currency of currencies.filter((c) => c.tenantId === tenant.id)) {
          const rate = currency.code === 'USD'
            ? new Decimal(1)
            : new Decimal(faker.number.float({ min: 3, max: 10, fractionDigits: 2 }));
          const convertedUnitPrice = unitPrice.mul(rate);
          const convertedSubtotal = subTotal.mul(rate);

          const price = await prisma.purchasePriceInCurrency.create({
            data: {
              id: faker.string.uuid(),
              purchaseDetailId: purchaseDetail.id,
              currencyId: currency.id,
              unitPrice: convertedUnitPrice,
              subTotal: convertedSubtotal,
              exchangeRate: rate,
              tenantId: tenant.id,
              subsidiaryId: subsidiary.id,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          prices.push(price);
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            lastPurchasePriceUSD: unitPrice,
            lastPurchaseDate: new Date(),
          },
        });
      }
    }
  }

  return { purchases, details, prices };
}
