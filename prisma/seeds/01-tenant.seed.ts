import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";

type SeededTenant = {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
};

export async function seedTenant(): Promise<SeededTenant[]> {
  console.log("⏳ Seeding tenants...");

  const tenants = [
    {
      name: "PERU - LIBRERÍA",
      description: "Empresa peruana especializada en libros escolares.",
    },
    {
      name: "BOLIVIA - MATERIAL DE ESCRITORIO",
      description: "Empresa boliviana dedicada a útiles escolares y oficina.",
    },
    {
      name: "PERU - JUGUETERÍA",
      description: "Empresa peruana enfocada en juguetes educativos.",
    },
    {
      name: "PERU - CAFETERÍA CULTURAL",
      description:
        "Cafetería que promueve actividades culturales y café peruano.",
    },
    {
      name: "TENANT TEMPORAL",
      description: "Tenant de prueba para verificar eliminación completa.",
    },
  ];

  const results: SeededTenant[] = [];

  for (const tenant of tenants) {
    const normalized = normalize(tenant.name.trim());

    const existing = await prisma.tenant.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
      },
    });

    if (existing) {
      console.log(`⚠️ Tenant "${tenant.name}" already exists`);
      results.push({
        id: existing.id,
        name: existing.name,
        description: existing.description,
        status: existing.status,
        created_at: existing.created_at,
        updated_at: existing.updated_at,
      });
      continue;
    }

    const created = await prisma.tenant.create({
      data: {
        name: normalized,
        description: tenant.description,
      },
    });

    console.log(`✅ Tenant "${created.name}" created`);
    results.push({
      id: created.id,
      name: created.name,
      description: created.description,
      status: created.status,
      created_at: created.created_at,
      updated_at: created.updated_at,
    });
  }

  return results;
}
