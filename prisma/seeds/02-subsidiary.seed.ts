import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { SeededTenant } from "./01-tenant.seed";

type SeededSubsidiary = {
  id: string;
  name: string;
  subsidiary_type: string;
  status: boolean;
  tenantId: string;
  maxUsers: number;
  maxRoles: number;
};

export async function seedSubsidiaries(
  tenants: SeededTenant[]
): Promise<SeededSubsidiary[]> {
  console.log("⏳ Seeding subsidiaries...");

  const results: SeededSubsidiary[] = [];

  // 1️⃣ SEMILLA FIJA: Tenant UUID fijo
  const fixedTenantId = "00000000-0000-0000-0000-000000000000";
  const fixedSubsidiaryId = "00000000-0000-0000-0000-000000000000";

  // Verifica existencia del Tenant fijo
  const fixedTenant = await prisma.tenant.findUnique({
    where: { id: fixedTenantId },
  });

  if (!fixedTenant) {
    throw new Error(
      `❌ Tenant fijo con ID "${fixedTenantId}" no existe. Asegúrate de crearlo primero.`
    );
  }

  // Verifica existencia de la Subsidiary fija
  const fixedSubsidiary = await prisma.subsidiary.findUnique({
    where: { id: fixedSubsidiaryId },
  });

  if (fixedSubsidiary) {
    console.log(`⚠️ Subsidiary fija "${fixedSubsidiaryId}" ya existe.`);
    results.push({
      id: fixedSubsidiary.id,
      name: fixedSubsidiary.name,
      subsidiary_type: fixedSubsidiary.subsidiary_type,
      status: fixedSubsidiary.status,
      tenantId: fixedSubsidiary.tenantId,
      maxUsers: fixedSubsidiary.maxUsers,
      maxRoles: fixedSubsidiary.maxRoles,
    });
  } else {
    // Crea la Subsidiary fija
    const createdFixed = await prisma.subsidiary.create({
      data: {
        id: fixedSubsidiaryId,
        tenantId: fixedTenantId,
        name: "MATRIZ PRINCIPAL",
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
      },
    });

    console.log(
      `✅ Subsidiary fija "${createdFixed.id}" creada bajo Tenant "${fixedTenantId}".`
    );

    results.push({
      id: createdFixed.id,
      name: createdFixed.name,
      subsidiary_type: createdFixed.subsidiary_type,
      status: createdFixed.status,
      tenantId: createdFixed.tenantId,
      maxUsers: createdFixed.maxUsers,
      maxRoles: createdFixed.maxRoles,
    });
  }

  // 2️⃣ Lógica dinámica para los demás tenants
  for (const tenant of tenants) {
    if (tenant.id === fixedTenantId) {
      continue; // Ya se hizo arriba
    }

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
      let type = "MATRIZ";
      if (i > 0) {
        const types = ["SUCURSAL", "ALMACEN", "OFICINA"];
        type = types[(i - 1) % types.length];
      }

      const tenantSuffix = tenant.name.split("-")[1]?.trim() || "SUBSIDIARY";
      const name = `${tenantSuffix} ${type} ${i + 1}`;
      const normalizedName = normalize(name.trim());

      const exists = await prisma.subsidiary.findFirst({
        where: {
          tenantId: tenant.id,
          name: { equals: normalizedName, mode: "insensitive" },
        },
      });

      if (exists) {
        console.log(
          `⚠️ Subsidiary "${normalizedName}" ya existe en Tenant "${tenant.name}".`
        );
        results.push({
          id: exists.id,
          name: exists.name,
          subsidiary_type: exists.subsidiary_type,
          status: exists.status,
          tenantId: tenant.id,
          maxUsers: exists.maxUsers,
          maxRoles: exists.maxRoles,
        });
        continue;
      }

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
          name: normalizedName,
          subsidiary_type: type as any,
          maxUsers,
          maxRoles,
          allowNegativeStock: false,
        },
      });

      console.log(
        `✅ Subsidiary "${created.name}" creada con tipo "${type}" | Máx. Users: ${maxUsers} | Máx. Roles: ${maxRoles}`
      );

      results.push({
        id: created.id,
        name: created.name,
        subsidiary_type: created.subsidiary_type,
        status: created.status,
        tenantId: created.tenantId,
        maxUsers: created.maxUsers,
        maxRoles: created.maxRoles,
      });
    }
  }

  console.log("✅ Seed de subsidiaries completado.\n");
  return results;
}
