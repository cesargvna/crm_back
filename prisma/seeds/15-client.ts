import prisma from "../../src/utils/prisma";
import { Subsidiary, ClientCategory, Client, User } from "../../generated/prisma"; // Ajusta si usas tus propios tipos

export async function seedClients(
  subsidiaries: Subsidiary[],
  clientCategories: ClientCategory[]
): Promise<Client[]> {
  console.log("⏳ Seeding clients...");

  const createdClients: Client[] = [];

  for (const subsidiary of subsidiaries) {
    // 🚫 Saltar tenant o subsidiary nulos
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} for clients.`);
      continue;
    }

    // Filtra categorías de cliente de esta subsidiaria
    const categoriesForSubsidiary = clientCategories.filter(
      (c) => c.subsidiaryId === subsidiary.id
    );

    if (categoriesForSubsidiary.length === 0) {
      console.log(`⏭️ No client categories for subsidiary ${subsidiary.id}`);
      continue;
    }

    for (const category of categoriesForSubsidiary) {
      const client = await prisma.client.upsert({
        where: {
          name_tenantId_subsidiaryId: {
            name: `Cliente Demo - ${category.name}`,
            tenantId: subsidiary.tenantId,
            subsidiaryId: subsidiary.id,
          },
        },
        update: {},
        create: {
          name: `Cliente Demo - ${category.name}`,
          lastname: "Apellido",
          ci: "12345678",
          nit: "87654321",
          description: `Cliente demo para categoría ${category.name}`,
          address: "Av. Ejemplo #123",
          cellphone: "+59170000000",
          telephone: "+59140000000",
          email: `cliente.${category.name
            .toLowerCase()
            .replace(/\s+/g, "")}@example.com`,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
          clientCategoryId: category.id,
          client_points: 0,
          status: true,
        },
      });

      createdClients.push(client);
    }
  }

  console.log(`✅ Clients seeded: ${createdClients.length}`);
  return createdClients;
}
