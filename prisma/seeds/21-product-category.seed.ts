import prisma from "../../src/utils/prisma";

export async function seedProductCategories(subsidiaries) {
  console.log("🗂️ Seeding Product Categories...");

  for (const s of subsidiaries) {
    // ✅ Ignorar subsidiarias o tenants dummy con UUID 0000...
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (or tenant ${s.tenantId}) for product categories.`);
      continue;
    }

    // ✅ Crear categorías para cada subsidiaria válida
    await prisma.productCategory.createMany({
      data: [
        {
          name: "Escritura",
          description: "Lápices, bolígrafos, plumones",
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
        {
          name: "Cuadernos y Libretas",
          description: "Cuadernos, agendas, blocks",
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
        {
          name: "Adhesivos y Cintas",
          description: "Cinta adhesiva, pegamento",
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        }
      ],
      skipDuplicates: true,
    });

    console.log(`✅ Product categories created for subsidiary ${s.id}`);
  }

  // ✅ Retornar todas las categorías creadas
  const all = await prisma.productCategory.findMany();
  console.log("✅ Total Product Categories:", all.length);
  return all;
}
