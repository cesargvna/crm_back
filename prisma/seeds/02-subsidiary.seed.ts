// prisma/seeders/02-subsidiary.seed.ts
import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { SeededTenant } from "./01-tenant.seed";

type SeededSubsidiary = {
  id: string;
  name: string;
  shortname: string;
  subsidiary_type: "MATRIZ" | "SUCURSAL" | "ALMACEN" | "OFICINA";
  status: boolean;
  tenantId: string;
  maxUsers: number;
  maxRoles: number;
  allowNegativeStock: boolean;
  nopCommerceStatus: boolean;
  created_at: Date;
  updated_at: Date;
};

// ---------- helpers ----------
function toUpperNormalized(input: string | null | undefined): string | null {
  if (!input) return null;
  const n = normalize(input).replace(/\s+/g, " ").trim();
  return n.toUpperCase();
}

// Solo [a-z0-9], minúsculas, 3–10 chars
function cleanShortnameStrict(s: string): string {
  const cleaned = normalize(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned.length < 3) {
    throw new Error(
      `shortname "${s}" inválido: usa solo [a-z0-9] y mínimo 3 caracteres`
    );
  }
  return cleaned.slice(0, 10);
}

// Genera un base corto a partir del shortname del tenant + tipo + índice
function typeCode(t: "MATRIZ" | "SUCURSAL" | "ALMACEN" | "OFICINA"): string {
  switch (t) {
    case "MATRIZ":
      return "mtz";
    case "SUCURSAL":
      return "suc";
    case "ALMACEN":
      return "alm";
    case "OFICINA":
      return "ofc";
  }
}

function buildShortnameBase(
  tenantShort: string,
  t: "MATRIZ" | "SUCURSAL" | "ALMACEN" | "OFICINA",
  idx: number
): string {
  // ej: ten short "perulib" + "suc" + "1" => "perulibsuc1"
  const base = `${tenantShort}${typeCode(t)}${idx}`;
  return cleanShortnameStrict(base);
}

// Asegura unicidad de shortname POR TENANT (unique composite)
async function ensureUniqueShortnameWithinTenant(
  tenantId: string,
  base: string
): Promise<string> {
  let candidate = base.slice(0, 10);
  let n = 1;
  while (true) {
    const exists = await prisma.subsidiary.findFirst({
      where: { tenantId, shortname: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;

    n += 1;
    const suffix = String(n);
    candidate = (base.slice(0, 10 - suffix.length) + suffix).slice(0, 10);
  }
}
// ---------- helpers ----------

export async function seedSubsidiaries(
  tenants: SeededTenant[]
): Promise<SeededSubsidiary[]> {
  console.log("⏳ Seeding subsidiaries...");

  const results: SeededSubsidiary[] = [];

  // 1) SEMILLA FIJA: Tenant & Subsidiary con UUID fijo
  const fixedTenantId = "00000000-0000-0000-0000-000000000000";
  const fixedSubsidiaryId = "00000000-0000-0000-0000-000000000000";

  const fixedTenant = await prisma.tenant.findUnique({
    where: { id: fixedTenantId },
  });
  if (!fixedTenant) {
    throw new Error(
      `❌ Tenant fijo con ID "${fixedTenantId}" no existe. Asegúrate de crearlo primero.`
    );
  }

  // Nombre y shortname para la fija
  const fixedNameUC = toUpperNormalized("MATRIZ PRINCIPAL")!;
  const fixedBaseShort = buildShortnameBase(
    fixedTenant.shortname,
    "MATRIZ",
    1
  );
  const fixedShortname = await ensureUniqueShortnameWithinTenant(
    fixedTenantId,
    fixedBaseShort
  );

  const fixedExisting = await prisma.subsidiary.findUnique({
    where: { id: fixedSubsidiaryId },
  });

  if (fixedExisting) {
    console.log(
      `⚠️ Subsidiary fija "${fixedSubsidiaryId}" ya existe (shortname: ${fixedExisting.shortname}).`
    );
    results.push({
      id: fixedExisting.id,
      name: fixedExisting.name,
      shortname: fixedExisting.shortname,
      subsidiary_type: fixedExisting.subsidiary_type as any,
      status: fixedExisting.status,
      tenantId: fixedExisting.tenantId,
      maxUsers: fixedExisting.maxUsers,
      maxRoles: fixedExisting.maxRoles,
      allowNegativeStock: fixedExisting.allowNegativeStock,
      nopCommerceStatus: fixedExisting.nopCommerceStatus,
      created_at: fixedExisting.created_at,
      updated_at: fixedExisting.updated_at,
    });
  } else {
    const createdFixed = await prisma.subsidiary.create({
      data: {
        id: fixedSubsidiaryId,
        tenantId: fixedTenantId,
        name: fixedNameUC,
        shortname: fixedShortname,
        subsidiary_type: "MATRIZ",
        maxUsers: Math.max(
          1,
          Math.floor(fixedTenant.maxUsers / fixedTenant.maxSubsidiaries)
        ),
        maxRoles: Math.max(
          1,
          Math.floor(fixedTenant.maxRoles / fixedTenant.maxSubsidiaries)
        ),
        allowNegativeStock: false,
        nopCommerceStatus: false,
      },
    });

    console.log(
      `✅ Subsidiary fija "${createdFixed.id}" creada bajo Tenant "${fixedTenantId}" | shortname="${createdFixed.shortname}".`
    );

    results.push({
      id: createdFixed.id,
      name: createdFixed.name,
      shortname: createdFixed.shortname,
      subsidiary_type: createdFixed.subsidiary_type as any,
      status: createdFixed.status,
      tenantId: createdFixed.tenantId,
      maxUsers: createdFixed.maxUsers,
      maxRoles: createdFixed.maxRoles,
      allowNegativeStock: createdFixed.allowNegativeStock,
      nopCommerceStatus: createdFixed.nopCommerceStatus,
      created_at: createdFixed.created_at,
      updated_at: createdFixed.updated_at,
    });
  }

  // 2) Dinámico para los demás tenants
  for (const tenant of tenants) {
    if (tenant.id === fixedTenantId) continue;

    const existingCount = await prisma.subsidiary.count({
      where: { tenantId: tenant.id },
    });

    const toCreate = tenant.maxSubsidiaries - existingCount;
    if (toCreate <= 0) {
      console.log(
        `⚠️ Tenant "${tenant.name}" ya tiene ${existingCount} subsidiaries (máx ${tenant.maxSubsidiaries}).`
      );
      continue;
    }

    console.log(
      `➡️ Creando ${toCreate} subsidiaries para Tenant "${tenant.name}"...`
    );

    for (let i = 0; i < toCreate; i++) {
      const idx = i + 1;
      const type: "MATRIZ" | "SUCURSAL" | "ALMACEN" | "OFICINA" =
        i === 0 ? "MATRIZ" : (["SUCURSAL", "ALMACEN", "OFICINA"][
          (i - 1) % 3
        ] as any);

      // Nombre visible derivado (segunda parte del nombre del tenant si existe)
      const tenantSuffix =
        tenant.name.split(" - ")[1]?.trim() ||
        tenant.name ||
        "SUBSIDIARY";
      const nameUC = toUpperNormalized(`${tenantSuffix} ${type} ${idx}`)!;

      // Idempotencia por (tenantId, name)
      const exists = await prisma.subsidiary.findFirst({
        where: {
          tenantId: tenant.id,
          name: { equals: nameUC, mode: "insensitive" },
        },
      });
      if (exists) {
        console.log(
          `⚠️ Subsidiary "${nameUC}" ya existe en Tenant "${tenant.name}".`
        );
        results.push({
          id: exists.id,
          name: exists.name,
          shortname: exists.shortname,
          subsidiary_type: exists.subsidiary_type as any,
          status: exists.status,
          tenantId: exists.tenantId,
          maxUsers: exists.maxUsers,
          maxRoles: exists.maxRoles,
          allowNegativeStock: exists.allowNegativeStock,
          nopCommerceStatus: exists.nopCommerceStatus,
          created_at: exists.created_at,
          updated_at: exists.updated_at,
        });
        continue;
      }

      // shortname determinista a partir del shortname del tenant
      const base = buildShortnameBase(tenant.shortname, type, idx);
      const shortname = await ensureUniqueShortnameWithinTenant(
        tenant.id,
        base
      );

      const maxUsers = Math.max(
        1,
        Math.floor(tenant.maxUsers / tenant.maxSubsidiaries)
      );
      const maxRoles = Math.max(
        1,
        Math.floor(tenant.maxRoles / tenant.maxSubsidiaries)
      );

      const created = await prisma.subsidiary.create({
        data: {
          tenantId: tenant.id,
          name: nameUC,
          shortname,
          subsidiary_type: type,
          maxUsers,
          maxRoles,
          allowNegativeStock: false,
          nopCommerceStatus: false,
        },
      });

      console.log(
        `✅ Subsidiary "${created.name}" creada (type "${type}") | shortname="${created.shortname}" | MáxUsers: ${maxUsers} | MáxRoles: ${maxRoles}`
      );

      results.push({
        id: created.id,
        name: created.name,
        shortname: created.shortname,
        subsidiary_type: created.subsidiary_type as any,
        status: created.status,
        tenantId: created.tenantId,
        maxUsers: created.maxUsers,
        maxRoles: created.maxRoles,
        allowNegativeStock: created.allowNegativeStock,
        nopCommerceStatus: created.nopCommerceStatus,
        created_at: created.created_at,
        updated_at: created.updated_at,
      });
    }
  }

  console.log("✅ Seed de subsidiaries completado.\n");
  return results;
}
