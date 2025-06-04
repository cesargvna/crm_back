import { v4 as uuidv4 } from "uuid";
import { DayOfWeek, SubsidiaryType } from "../../generated/prisma";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const seedSubsidiaries = async () => {
  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    const subsidiaries = [
      {
        name: `Casa Matriz ${tenant.name.split(" ")[0]}`,
        subsidiary_type: SubsidiaryType.MATRIZ,
        allowNegativeStock: true,
        city: "Lima",
        country: "Perú",
      },
      {
        name: `Sucursal Central ${tenant.name.split(" ")[0]}`,
        subsidiary_type: SubsidiaryType.SUCURSAL,
        allowNegativeStock: false,
        city: "Santa Cruz",
        country: "Bolivia",
      },
    ];

    for (const sub of subsidiaries) {
      const exists = await prisma.subsidiary.findFirst({
        where: { name: sub.name, tenantId: tenant.id },
      });

      if (exists) {
        console.log(`⏩ Subsidiary already exists: ${sub.name}`);
        continue;
      }

      const newSub = await prisma.subsidiary.create({
        data: {
          id: uuidv4(),
          name: sub.name,
          subsidiary_type: sub.subsidiary_type,
          allowNegativeStock: sub.allowNegativeStock,
          address: `Av. Principal de ${sub.name}`,
          city: sub.city,
          country: sub.country,
          ci: "12345678",
          nit: "1002003001",
          cellphone: "70000000",
          telephone: "3000000",
          email: `${sub.name.toLowerCase().replace(/\s/g, "")}@correo.com`,
          tenantId: tenant.id,
        },
      });

      await prisma.scheduleSubsidiary.create({
        data: {
          id: uuidv4(),
          subsidiaryId: newSub.id,
          tenantId: tenant.id,
          start_day: DayOfWeek.LUNES,
          end_day: DayOfWeek.VIERNES,
          opening_hour: new Date("2024-01-01T08:00:00Z"),
          closing_hour: new Date("2024-01-01T18:00:00Z"),
        },
      });

      console.log(`✅ Subsidiary created: ${sub.name}`);
    }
  }
};
