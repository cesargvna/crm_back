import { User } from "../generated/prisma";
import prisma from "../src/utils/prisma";
import { seedTenant } from "./seeds/01-tenant.seed";
import { seedSubsidiaries } from "./seeds/02-subsidiary.seed";
import { scheduleSubsidiaries } from "./seeds/03-schedule-subsidiaries";
import { seedActions } from "./seeds/04-action.seed";
import { seedSections } from "./seeds/05-section-module-submodule.seed";
import { seedAllowedActions } from "./seeds/06-allowed-actions.seed";
import { seedRolesAndPermissions } from "./seeds/07-role.seed";
import { seedUsers } from "./seeds/08-user.seed";
import { seedScheduleUsers } from "./seeds/09-schedule-users.seed";
import { seedExpenseCategories } from "./seeds/10-expense-category";
import { seedExpenses } from "./seeds/11-expense";
import { seedIncomeCategories } from "./seeds/12-income-category";
import { seedIncomes } from "./seeds/13-income";
import { seedClientCategories } from "./seeds/14-client-category";
import { seedClients } from "./seeds/15-client";
import { seedSupplierCategories } from "./seeds/16-supplier-category";
import { seedSuppliers } from "./seeds/17-supplier";
import { seedCurrencies } from "./seeds/18-currency.seed";
import { seedPriceTypes } from "./seeds/20-price-type.seed";
import { seedProductCategories } from "./seeds/21-product-category.seed";
import { seedUnitMeasurements } from "./seeds/22-unit-measurement.seed";
import { seedProducts } from "./seeds/23-product.seed";
import { seedPurchases } from "./seeds/24-purchase.seed";
import { seedSales } from "./seeds/26-sale.seed";
import { seedCashSessions } from "./seeds/30-cash-session";

async function main() {
  console.log("🌱 Seeding started...");

  // 1️⃣ Tenants, Subsidiarias y estructura
  const tenants = await seedTenant();
  const subsidiaries = await seedSubsidiaries(tenants);
  const subsidiariesFull = await prisma.subsidiary.findMany({
    where: { id: { in: subsidiaries.map((s) => s.id) } },
  });
  await scheduleSubsidiaries(subsidiariesFull);

  // 2️⃣ Seguridad, usuarios, sesiones
  const actions = await seedActions();
  const sections = await seedSections();
  const allowedActions = await seedAllowedActions(sections, actions);
  const roles = await seedRolesAndPermissions(
    tenants,
    subsidiariesFull,
    allowedActions
  );
  const users: User[] = await seedUsers(roles, subsidiariesFull);
  await seedScheduleUsers(users);
  await seedCashSessions(users);

  // 3️⃣ Categorías, clientes, proveedores
  const expenseCategories = await seedExpenseCategories(subsidiariesFull);
  await seedExpenses(subsidiariesFull, expenseCategories, users);
  const incomeCategories = await seedIncomeCategories(subsidiariesFull);
  await seedIncomes(subsidiariesFull, incomeCategories, users);
  const clientCategories = await seedClientCategories(subsidiariesFull);
  const clients = await seedClients(subsidiariesFull, clientCategories);
  const supplierCategories = await seedSupplierCategories(subsidiariesFull);
  const suppliers = await seedSuppliers(subsidiariesFull, supplierCategories);

  // 4️⃣ Datos económicos
  const currencies = await seedCurrencies(subsidiariesFull);
  const priceTypes = await seedPriceTypes(subsidiariesFull);

  // 5️⃣ Productos y compras
  const productCategories = await seedProductCategories(subsidiariesFull);
  const units = await seedUnitMeasurements(subsidiariesFull);
  const products = await seedProducts(
    subsidiariesFull,
    productCategories,
    units
  );
/*
  // 6️⃣ Compras 
  await seedPurchases({
    tenants,
    subsidiaries: subsidiariesFull,
    users,
    suppliers,
    products,
    currencies,
  });
*/



  console.log("✅ Seeding completed.");
}

main().catch((err) => {
  console.error("❌ Error in seed:", err);
  process.exit(1);
});
