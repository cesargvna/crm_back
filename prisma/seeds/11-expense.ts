import prisma from "../../src/utils/prisma";
import { User, Subsidiary, ExpenseCategory, Expense} from "../../generated/prisma"; // Usa los tipos reales

export async function seedExpenses(
  subsidiaries: Subsidiary[],
  expenseCategories: ExpenseCategory[],
  users: User[]
): Promise<Expense[]> {
  console.log("⏳ Seeding expenses...");

  const createdExpenses: Expense[] = [];

  for (const subsidiary of subsidiaries) {
    // Filtra categorías de esta subsidiaria
    const categoriesForSubsidiary = expenseCategories.filter(
      (c) => c.subsidiaryId === subsidiary.id
    );

    // Filtra usuarios de esta subsidiaria
    const usersForSubsidiary = users.filter(
      (u) => u.subsidiaryId === subsidiary.id
    );

    if (categoriesForSubsidiary.length === 0 || usersForSubsidiary.length === 0) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} for expenses.`);
      continue;
    }

    // Crea 1 gasto por categoría como ejemplo
    for (const category of categoriesForSubsidiary) {
      const user = usersForSubsidiary[0]; // o random si prefieres

      const expense = await prisma.expense.create({
        data: {
          name: `Gasto de prueba - ${category.name}`,
          description: `Descripción ejemplo para ${category.name}`,
          quantity: 1,
          unit_price: 100.00,
          total_amount: 100.00, // O quantity * unit_price
          expenseCategoryId: category.id,
          userId: user.id,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      createdExpenses.push(expense);
    }
  }

  console.log(`✅ Expenses seeded: ${createdExpenses.length}`);
  return createdExpenses;
}
