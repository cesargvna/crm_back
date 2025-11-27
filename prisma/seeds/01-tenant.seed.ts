// prisma/seeders/tenant.seeder.ts
import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";

export type SeededTenant = {
  id: string;
  name: string;
  shortname: string;
  description: string | null;
  status: boolean;
  maxSubsidiaries: number;
  maxRoles: number;
  maxUsers: number;
  created_at: Date;
  updated_at: Date;
};

// --- helpers ---
function toUpperNormalized(input: string | null | undefined): string | null {
  if (!input) return null;
  const n = normalize(input).replace(/\s+/g, " ").trim();
  return n.toUpperCase();
}

// Mantiene solo [a-z0-9], fuerza minúsculas y recorta a 10.
// Si queda <3, lanza error (porque shortname es requerido y manual).
function cleanShortnameStrict(s: string): string {
  const cleaned = normalize(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned.length < 3) {
    throw new Error(
      `shortname "${s}" inválido: usa solo [a-z0-9] y mínimo 3 caracteres`
    );
  }
  return cleaned.slice(0, 10); // máximo 10
}

// Si existe, agrega sufijo numérico dentro del límite de 10 chars.
async function ensureUniqueShortname(base: string): Promise<string> {
  let candidate = base.slice(0, 10);
  let n = 1;
  // intenta sin sufijo primero
  while (true) {
    const exists = await prisma.tenant.findUnique({
      where: { shortname: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;

    n += 1;
    const suffix = String(n); // "2", "3", ...
    candidate = (base.slice(0, 10 - suffix.length) + suffix).slice(0, 10);
  }
}
// --- helpers ---

export async function seedTenant(): Promise<SeededTenant[]> {
  console.log("⏳ Seeding tenants...");

  // ⬇️ Shortnames definidos MANUALMENTE (solo [a-z0-9], 3–10)
  const tenants: Array<{
    name: string;
    shortname: string; // ← requerido
    description?: string | null;
    id?: string;
    maxSubsidiaries: number;
    maxRoles: number;
    maxUsers: number;
  }> = [
    {
      name: "PERU - LIBRERÍA",
      shortname: "perulib",
      description: "Empresa peruana especializada en libros escolares.",
      maxSubsidiaries: 1,
      maxRoles: 3,
      maxUsers: 3,
    },
    {
      name: "BOLIVIA - MATERIAL DE ESCRITORIO",
      shortname: "bolimat",
      description: "Empresa boliviana dedicada a útiles escolares y oficina.",
      maxSubsidiaries: 2,
      maxRoles: 6,
      maxUsers: 10,
    },
    {
      name: "PERU - JUGUETERÍA",
      shortname: "perujug",
      description: "Empresa peruana enfocada en juguetes educativos.",
      maxSubsidiaries: 5,
      maxRoles: 25,
      maxUsers: 50,
    },
    {
      name: "PERU - CAFETERÍA CULTURAL",
      shortname: "perucafe",
      description: "Cafetería que promueve actividades culturales y café.",
      maxSubsidiaries: 3,
      maxRoles: 9,
      maxUsers: 20,
    },
    {
      name: "TENANT TEMPORAL",
      shortname: "temporal",
      description: "Tenant de prueba para verificar eliminación completa.",
      maxSubsidiaries: 1,
      maxRoles: 5,
      maxUsers: 10,
    },
    {
      name: "TENANT ESPECIAL",
      shortname: "especial",
      description: "Tenant especial con ID fijo y valores por defecto.",
      id: "00000000-0000-0000-0000-000000000000",
      maxSubsidiaries: 1,
      maxRoles: 1,
      maxUsers: 1,
    },
  ];

  const results: SeededTenant[] = [];

  for (const t of tenants) {
    const nameUC = toUpperNormalized(t.name)!; // requerido
    const descriptionUC = toUpperNormalized(t.description ?? null);

    // Validar/normalizar shortname manual
    const shortBase = cleanShortnameStrict(t.shortname);
    const shortname = await ensureUniqueShortname(shortBase);

    // Idempotencia por nombre (case-insensitive)
    const existing = await prisma.tenant.findFirst({
      where: { name: { equals: nameUC, mode: "insensitive" } },
    });

    if (existing) {
      console.log(
        `⚠️ Tenant "${nameUC}" ya existe (shortname: ${existing.shortname}).`
      );
      results.push({
        id: existing.id,
        name: existing.name,
        shortname: existing.shortname,
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
        id: t.id ?? undefined,
        name: nameUC,
        shortname,
        description: descriptionUC,
        maxSubsidiaries: t.maxSubsidiaries,
        maxRoles: t.maxRoles,
        maxUsers: t.maxUsers,
      },
    });

    console.log(
      `✅ Tenant "${created.name}" creado | shortname="${created.shortname}" | MáxSubs: ${created.maxSubsidiaries} | MáxRoles: ${created.maxRoles} | MáxUsers: ${created.maxUsers}`
    );

    results.push({
      id: created.id,
      name: created.name,
      shortname: created.shortname,
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
