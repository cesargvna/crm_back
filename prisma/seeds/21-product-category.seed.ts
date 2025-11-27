// prisma/seeders/04-product-category.seed.ts
import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { ProductCategory } from "../../generated/prisma";

type SubsidiaryLite = { id: string; tenantId: string };

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";

// Helpers
const toUpperNormalized = (s?: string | null) =>
  s ? normalize(s).replace(/\s+/g, " ").trim().toUpperCase() : null;

const BASE_CATEGORIES: Array<{ name: string; description?: string | null }> = [
  { name: "Escritura",            description: "Lápices, bolígrafos, plumones" },
  { name: "Cuadernos y Libretas", description: "Cuadernos, agendas, blocks" },
  { name: "Adhesivos y Cintas",   description: "Cinta adhesiva, pegamento" },
];

// Seeder
export async function seedProductCategories(
  subsidiaries: SubsidiaryLite[]
): Promise<ProductCategory[]> {
  console.log("🗂️ Seeding Product Categories...");

  const validSubs = subsidiaries.filter(
    (s) => s.id !== FIXED_UUID && s.tenantId !== FIXED_UUID
  );

  const ensured: ProductCategory[] = [];

  for (const s of validSubs) {
    for (const cat of BASE_CATEGORIES) {
      const nameUC = toUpperNormalized(cat.name)!;
      const descUC = toUpperNormalized(cat.description ?? null);

      // ¿Existe (case-insensitive) en esta subsidiaria?
      const existing = await prisma.productCategory.findFirst({
        where: {
          subsidiaryId: s.id,
          name: { equals: nameUC, mode: "insensitive" },
        },
      });

      if (existing) {
        // Si difiere en casing/descr, normaliza
        if (existing.name !== nameUC || existing.description !== descUC) {
          const updated = await prisma.productCategory.update({
            where: { id: existing.id },
            data: { name: nameUC, description: descUC },
          });
          ensured.push(updated);
          console.log(`♻️  Normalized category "${nameUC}" in subsidiary ${s.id}`);
        } else {
          ensured.push(existing);
          console.log(`⚠️  Category "${nameUC}" already exists in subsidiary ${s.id}`);
        }
        continue;
      }

      // Crear nuevo
      const created = await prisma.productCategory.create({
        data: {
          name: nameUC,
          description: descUC,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
          // status: true // usa el default del schema
        },
      });
      ensured.push(created);
      console.log(`✅ Created category "${nameUC}" for subsidiary ${s.id}`);
    }
  }

  console.log(`✅ Product categories ensured for ${validSubs.length} subsidiaries.`);
  return ensured;
}