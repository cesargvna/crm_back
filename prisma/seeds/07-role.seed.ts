import prisma from "../../src/utils/prisma";
import { Tenant, Subsidiary, AllowedAction } from "../../generated/prisma";

export async function seedRolesAndPermissions(
  tenants: Tenant[],
  subsidiaries: Subsidiary[],
  allowedActionsSeed: AllowedAction[]
) {
  console.log("\n🚀 Seeding System.Admin + all Subsidiary roles with permissions...");

  const fixedTenantId = "00000000-0000-0000-0000-000000000000";
  const fixedSubsidiaryId = "00000000-0000-0000-0000-000000000000";

  // === 1️⃣ Cargar secciones visibles y ocultas
  const visibleSections = await prisma.section.findMany({
    where: { visibility: true },
    include: {
      modules: {
        include: {
          allowedActions: { include: { action: true } },
        },
      },
    },
  });

  const hiddenSections = await prisma.section.findMany({
    where: { visibility: false },
    include: {
      modules: {
        include: {
          allowedActions: { include: { action: true } },
        },
      },
    },
  });

  // === 2️⃣ System.Admin único (solo secciones visibility: false)
  const existingSysAdmin = await prisma.role.findFirst({
    where: {
      name: "System.Admin",
      tenantId: fixedTenantId,
      subsidiaryId: fixedSubsidiaryId,
    },
  });

  if (!existingSysAdmin) {
    const sysAdminRole = await prisma.role.create({
      data: {
        name: "System.Admin",
        description: "System-wide admin for hidden sections",
        tenantId: fixedTenantId,
        subsidiaryId: fixedSubsidiaryId,
      },
    });

    const sysAdminPermissions: any[] = [];

    for (const section of hiddenSections) {
      for (const module of section.modules) {
        for (const allowed of module.allowedActions) {
          sysAdminPermissions.push({
            roleId: sysAdminRole.id,
            actionId: allowed.actionId,
            moduleId: allowed.moduleId ?? null,
            submoduleId: allowed.submoduleId ?? null,
            tenantId: fixedTenantId,
            subsidiaryId: fixedSubsidiaryId,
            compositeKey: `${sysAdminRole.id}_${allowed.actionId}_${allowed.moduleId || ''}_${allowed.submoduleId || ''}`,
          });
        }
      }
    }

    await prisma.rolePermission.createMany({
      data: sysAdminPermissions,
      skipDuplicates: true,
    });

    console.log(`✅ System.Admin created with ${sysAdminPermissions.length} permissions (visibility: false)`);
  } else {
    console.log("⚠️ System.Admin already exists.");
  }

  // === 3️⃣ Crear roles por Subsidiary (excluyendo la Subsidiary fija)
  const rolesBySubsidiary: Record<string, Record<string, any>> = {};

  for (const subsidiary of subsidiaries) {
    const { tenantId, id: subsidiaryId } = subsidiary;

    if (tenantId === fixedTenantId && subsidiaryId === fixedSubsidiaryId) {
      console.log(`🔒 Skipping roles for fixed Subsidiary ${subsidiaryId}`);
      continue; // Evitar roles adicionales en la Subsidiary fija
    }

    if (!rolesBySubsidiary[subsidiaryId]) {
      rolesBySubsidiary[subsidiaryId] = {};
    }

    // === Super.Admin ===
    const superAdminRole = await prisma.role.create({
      data: {
        name: "Super.Admin",
        description: "Full access to all visible sections",
        tenantId,
        subsidiaryId,
      },
    });

    const superAdminPermissions: any[] = [];
    for (const section of visibleSections) {
      for (const module of section.modules) {
        for (const allowed of module.allowedActions) {
          superAdminPermissions.push({
            roleId: superAdminRole.id,
            actionId: allowed.actionId,
            moduleId: allowed.moduleId ?? null,
            submoduleId: allowed.submoduleId ?? null,
            tenantId,
            subsidiaryId,
            compositeKey: `${superAdminRole.id}_${allowed.actionId}_${allowed.moduleId || ''}_${allowed.submoduleId || ''}`,
          });
        }
      }
    }

    await prisma.rolePermission.createMany({
      data: superAdminPermissions,
      skipDuplicates: true,
    });

    console.log(`✅ Super.Admin for Subsidiary ${subsidiaryId} with ${superAdminPermissions.length} permissions`);
    rolesBySubsidiary[subsidiaryId]["Super.Admin"] = superAdminRole;

    // === Admin ===
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        description: "Admin with restricted permissions",
        tenantId,
        subsidiaryId,
      },
    });

    const adminPermissions: any[] = [];
    for (const section of visibleSections) {
      for (const module of section.modules) {
        for (const allowed of module.allowedActions) {
          if (["eliminar", "exportar"].includes(allowed.action.name.toLowerCase())) {
            continue;
          }
          adminPermissions.push({
            roleId: adminRole.id,
            actionId: allowed.actionId,
            moduleId: allowed.moduleId ?? null,
            submoduleId: allowed.submoduleId ?? null,
            tenantId,
            subsidiaryId,
            compositeKey: `${adminRole.id}_${allowed.actionId}_${allowed.moduleId || ''}_${allowed.submoduleId || ''}`,
          });
        }
      }
    }

    await prisma.rolePermission.createMany({
      data: adminPermissions,
      skipDuplicates: true,
    });

    console.log(`✅ Admin for Subsidiary ${subsidiaryId} with ${adminPermissions.length} permissions`);
    rolesBySubsidiary[subsidiaryId]["Admin"] = adminRole;

    // === Ventas (opcional)
    const ventasRole = await prisma.role.create({
      data: {
        name: "Ventas",
        description: "Ventas role with access to sales modules",
        tenantId,
        subsidiaryId,
      },
    });

    const ventasPermissions: any[] = [];
    for (const section of visibleSections) {
      for (const module of section.modules) {
        if (!["Ventas", "Caja", "Cotizaciones", "Devoluciones"].includes(module.name)) continue;
        for (const allowed of module.allowedActions) {
          ventasPermissions.push({
            roleId: ventasRole.id,
            actionId: allowed.actionId,
            moduleId: allowed.moduleId ?? null,
            submoduleId: allowed.submoduleId ?? null,
            tenantId,
            subsidiaryId,
            compositeKey: `${ventasRole.id}_${allowed.actionId}_${allowed.moduleId || ''}_${allowed.submoduleId || ''}`,
          });
        }
      }
    }

    await prisma.rolePermission.createMany({
      data: ventasPermissions,
      skipDuplicates: true,
    });

    console.log(`✅ Ventas for Subsidiary ${subsidiaryId} with ${ventasPermissions.length} permissions`);
    rolesBySubsidiary[subsidiaryId]["Ventas"] = ventasRole;
  }

  console.log("\n🎉 All roles and permissions seeded!\n");
  return rolesBySubsidiary;
}
