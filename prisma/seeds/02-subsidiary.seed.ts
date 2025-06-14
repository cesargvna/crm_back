import prisma from "../../src/utils/prisma";
import { SubsidiaryType, Subsidiary } from "../../generated/prisma";

type TenantData = {
  id: string;
  name: string;
};

export async function seedSubsidiaries(tenants: TenantData[]): Promise<Subsidiary[]> {
  console.log("⏳ Seeding subsidiaries...");

  const allSubsidiaries: Subsidiary[] = [];

  for (const [index, tenant] of tenants.entries()) {
    const tenantId = tenant.id;

    // ✅ Matriz
    const matrizName = `MATRIZ - ${tenant.name}`;
    let matriz = await prisma.subsidiary.findFirst({
      where: {
        name: { equals: matrizName, mode: "insensitive" },
        tenantId,
      },
    });

    if (!matriz) {
      matriz = await prisma.subsidiary.create({
        data: {
          name: matrizName,
          subsidiary_type: SubsidiaryType.MATRIZ,
          tenantId,
          allowNegativeStock: false,
          address: "Av. Principal #123",
          city: "Ciudad Central",
          country: "País Genérico",
          email: `matriz@${tenant.name.toLowerCase().replace(/\s/g, "")}.com`,
          cellphone: "70000001",
        },
      });
      console.log(`✅ Matriz creada para ${tenant.name}`);
    } else {
      console.log(`⚠️ Matriz ya existe para ${tenant.name}`);
    }

    allSubsidiaries.push(matriz);

    // ✅ Sucursal A
    if (index % 2 === 0) {
      const sucAName = `Sucursal A - ${tenant.name}`;
      let sucA = await prisma.subsidiary.findFirst({
        where: {
          name: { equals: sucAName, mode: "insensitive" },
          tenantId,
        },
      });

      if (!sucA) {
        sucA = await prisma.subsidiary.create({
          data: {
            name: sucAName,
            subsidiary_type: SubsidiaryType.SUCURSAL,
            tenantId,
            allowNegativeStock: true,
            address: "Calle Secundaria #45",
            city: "Ciudad A",
            country: "País Genérico",
            email: `sucursalA@${tenant.name.toLowerCase().replace(/\s/g, "")}.com`,
            cellphone: "70000002",
          },
        });
        console.log(`✅ ${sucAName} creada`);
      } else {
        console.log(`⚠️ ${sucAName} ya existe`);
      }

      allSubsidiaries.push(sucA);
    }

    // ✅ Sucursal B
    if (index % 3 === 0) {
      const sucBName = `Sucursal B - ${tenant.name}`;
      let sucB = await prisma.subsidiary.findFirst({
        where: {
          name: { equals: sucBName, mode: "insensitive" },
          tenantId,
        },
      });

      if (!sucB) {
        sucB = await prisma.subsidiary.create({
          data: {
            name: sucBName,
            subsidiary_type: SubsidiaryType.SUCURSAL,
            tenantId,
            allowNegativeStock: false,
            address: "Av. Alternativa #789",
            city: "Ciudad B",
            country: "País Genérico",
            email: `sucursalB@${tenant.name.toLowerCase().replace(/\s/g, "")}.com`,
            cellphone: "70000003",
          },
        });
        console.log(`✅ ${sucBName} creada`);
      } else {
        console.log(`⚠️ ${sucBName} ya existe`);
      }

      allSubsidiaries.push(sucB);
    }
  }

  return allSubsidiaries;
}
