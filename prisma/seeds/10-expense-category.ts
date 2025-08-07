import prisma from "../../src/utils/prisma";
import { ExpenseCategory, Subsidiary } from "../../generated/prisma"; // ajusta si tienes tipos locales

export async function seedExpenseCategories(subsidiaries: Subsidiary[]) {
  console.log("⏳ Seeding expense categories...");

  const categories = [
    {
      name: 'Servicios Básicos',
      status: true,
      description: 'Gastos por consumo de luz, agua, gas, internet.',
    },
    {
      name: 'Alquiler de Oficina',
      status: true,
      description: 'Pago por el arrendamiento del espacio comercial.',
    },
    {
      name: 'Materiales y Suministros',
      status: true,
      description: 'Compra de bolsas, insumos, papelería.',
    },
    {
      name: 'Caja Chica',
      status: true,
      description: 'Gastos menores del día a día.',
    },
    {
      name: 'Sueldos y Salarios',
      status: true,
      description: 'Pago mensual al personal contratado.',
    },
    {
      name: 'Aportes Patronales',
      status: true,
      description: 'Aportes a la seguridad social (AFP, CNS, etc.).',
    },
    {
      name: 'Publicidad y Marketing',
      status: true,
      description: 'Gastos en promociones, anuncios, redes, etc.',
    },
    {
      name: 'Honorarios Profesionales',
      status: true,
      description: 'Servicios de contadores, abogados, etc.',
    },
    {
      name: 'Transporte y Movilidad',
      status: true,
      description: 'Pasajes, gasolina, envíos locales.',
    },
    {
      name: 'Mantenimiento y Reparaciones',
      status: true,
      description: 'Arreglo de equipos o infraestructura.',
    },
    {
      name: 'Servicios Bancarios',
      status: true,
      description: 'Comisiones, mantenimiento de cuenta.',
    },
    {
      name: 'Multas y Sanciones',
      status: true,
      description: 'Pagos por incumplimiento normativo.',
    },
    {
      name: 'Capacitación Personal',
      status: true,
      description: 'Cursos, talleres o formación del equipo.',
    },
  ];

  const createdExpenseCategories: ExpenseCategory[] = [];

  for (const subsidiary of subsidiaries) {
    // 🚫 Evitar tenant o subsidiary nulos
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} with tenant ${subsidiary.tenantId}`);
      continue;
    }

    for (const category of categories) {
      const expenseCategory = await prisma.expenseCategory.upsert({
        where: {
          name_tenantId_subsidiaryId: {
            name: category.name,
            tenantId: subsidiary.tenantId,
            subsidiaryId: subsidiary.id,
          },
        },
        update: {},
        create: {
          name: category.name,
          status: category.status,
          description: category.description,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      createdExpenseCategories.push(expenseCategory);
    }
  }

  console.log(`✅ Expense categories seeded: ${createdExpenseCategories.length}`);
  return createdExpenseCategories;
}
