import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";

export type SeededTenant = {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
  maxSubsidiaries: number;
  maxRoles: number;
  maxUsers: number;
  created_at: Date;
  updated_at: Date;
};

export async function seedTenant(): Promise<SeededTenant[]> {
  console.log("⏳ Seeding tenants...");

  const tenants = [
    {
      name: "PERU - LIBRERÍA",
      description: "Empresa peruana especializada en libros escolares.",
      maxSubsidiaries: 1,
      maxRoles: 3,
      maxUsers: 3,
    },
    {
      name: "BOLIVIA - MATERIAL DE ESCRITORIO",
      description: "Empresa boliviana dedicada a útiles escolares y oficina.",
      maxSubsidiaries: 2,
      maxRoles: 6,
      maxUsers: 10,
    },
    {
      name: "PERU - JUGUETERÍA",
      description: "Empresa peruana enfocada en juguetes educativos.",
      maxSubsidiaries: 5, // 5 subsidiarias
      maxRoles: 25,       // 5 roles por subsidiaria
      maxUsers: 50,       // 10 usuarios por subsidiaria
    },
    {
      name: "PERU - CAFETERÍA CULTURAL",
      description: "Cafetería que promueve actividades culturales y café peruano.",
      maxSubsidiaries: 3,
      maxRoles: 9,
      maxUsers: 20,
    },
    {
      name: "TENANT TEMPORAL",
      description: "Tenant de prueba para verificar eliminación completa.",
      maxSubsidiaries: 1,
      maxRoles: 5,
      maxUsers: 10,
    },
    {
      name: "TENANT ESPECIAL",
      description: "Tenant especial con ID fijo y valores por defecto.",
      id: "00000000-0000-0000-0000-000000000000",
      maxSubsidiaries: 1,
      maxRoles: 1,
      maxUsers: 1,
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
      console.log(`⚠️ Tenant "${tenant.name}" ya existe.`);
      results.push({
        id: existing.id,
        name: existing.name,
        description: existing.description,
        status: existing.status,
        maxSubsidiaries: existing.maxSubsidiaries,
        maxRoles: existing.maxRoles,
        maxUsers: existing.maxUsers,
        created_at: existing.created_at,
        updated_at: existing.updated_at,
      });
      continue;
    }

    const created = await prisma.tenant.create({
      data: {
        id: tenant.id ?? undefined, // Solo se usa si es el tenant especial
        name: normalized,
        description: tenant.description,
        maxSubsidiaries: tenant.maxSubsidiaries,
        maxRoles: tenant.maxRoles,
        maxUsers: tenant.maxUsers,
      },
    });

    console.log(
      `✅ Tenant "${created.name}" creado con configuración: Máx. Subsidiaries: ${created.maxSubsidiaries} | Máx. Roles: ${created.maxRoles} | Máx. Users: ${created.maxUsers}`
    );

    results.push({
      id: created.id,
      name: created.name,
      description: created.description,
      status: created.status,
      maxSubsidiaries: created.maxSubsidiaries,
      maxRoles: created.maxRoles,
      maxUsers: created.maxUsers,
      created_at: created.created_at,
      updated_at: created.updated_at,
    });
  }

  return results;
}
