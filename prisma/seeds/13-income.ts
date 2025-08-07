import prisma from "../../src/utils/prisma";
import { Subsidiary, IncomeCategory, Income, User } from "../../generated/prisma"; // Ajusta si tienes tipos locales

export async function seedIncomes(
  subsidiaries: Subsidiary[],
  incomeCategories: IncomeCategory[],
  users: User[]
): Promise<Income[]> {
  console.log("⏳ Seeding incomes...");

  const createdIncomes: Income[] = [];

  for (const subsidiary of subsidiaries) {
    // Filtra categorías de ingreso de esta subsidiaria
    const categoriesForSubsidiary = incomeCategories.filter(
      (c) => c.subsidiaryId === subsidiary.id
    );

    // Filtra usuarios de esta subsidiaria
    const usersForSubsidiary = users.filter(
      (u) => u.subsidiaryId === subsidiary.id
    );

    if (categoriesForSubsidiary.length === 0 || usersForSubsidiary.length === 0) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} for incomes.`);
      continue;
    }

    for (const category of categoriesForSubsidiary) {
      const user = usersForSubsidiary[0]; // o random si prefieres

      const quantity = 1;
      const unitPrice = 500.0; // Ajusta si quieres variarlo
      const totalAmount = quantity * unitPrice;

      const income = await prisma.income.create({
        data: {
          name: `Ingreso de prueba - ${category.name}`,
          description: `Ejemplo de ingreso para ${category.name}`,
          quantity: quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          incomeCategoryId: category.id,
          userId: user.id,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      createdIncomes.push(income);
    }
  }

  console.log(`✅ Incomes seeded: ${createdIncomes.length}`);
  return createdIncomes;
}
