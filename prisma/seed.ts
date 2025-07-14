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
import { seedExchangeRates } from "./seeds/19-exchange-rate.seed";
import { seedPriceTypes } from "./seeds/20-price-type.seed";
import { seedProductCategories } from "./seeds/22-product-category.seed";
import { seedUnitMeasurements } from "./seeds/23-unit-measurement.seed";
import { seedProducts } from "./seeds/24-product.seed";
import { seedProductPrices } from "./seeds/25-product-price.seed";

async function main() {
  console.log("🌱 Seeding started...");

  const tenants = await seedTenant();
  const subsidiaries = await seedSubsidiaries(tenants);
  const subsidiariesFull = await prisma.subsidiary.findMany({
    where: { id: { in: subsidiaries.map((s) => s.id) } },
  });

  await scheduleSubsidiaries(subsidiariesFull);
  const actions = await seedActions();
  const sections = await seedSections();
  const allowedActions = await seedAllowedActions(sections, actions);
  const roles = await seedRolesAndPermissions(tenants, subsidiariesFull, allowedActions);

  const users = await seedUsers(roles, subsidiariesFull);
  await seedScheduleUsers(users);

  const expenseCategories = await seedExpenseCategories(subsidiariesFull);
  const expenses = await seedExpenses(subsidiariesFull, expenseCategories, users);
  const incomeCategories = await seedIncomeCategories(subsidiariesFull);
  const incomes = await seedIncomes(subsidiariesFull, incomeCategories, users);

  const clientCategories = await seedClientCategories(subsidiariesFull);
  const clients = await seedClients(subsidiariesFull, clientCategories);
  const supplierCategories = await seedSupplierCategories(subsidiariesFull);
  const suppliers = await seedSuppliers(subsidiariesFull, supplierCategories);

  const currencies = await seedCurrencies(subsidiariesFull);
  const exchangeRates = await seedExchangeRates(subsidiariesFull, currencies);

  const priceTypes = await seedPriceTypes(subsidiariesFull);
  const productCategories = await seedProductCategories(subsidiariesFull);
  const units = await seedUnitMeasurements(subsidiariesFull);

  const products = await seedProducts(subsidiariesFull, productCategories, units);
 /*const productPrices = await seedProductPrices(
    subsidiariesFull,
    products,
    priceTypes,
    currencies
  );*/

  console.log("✅ Seeding completed.");
}

main().catch((err) => {
  console.error("❌ Error in seed:", err);
  process.exit(1);
});
