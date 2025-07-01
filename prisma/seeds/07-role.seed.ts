import prisma from "../../src/utils/prisma";
import { AllowedAction, Tenant, Subsidiary } from "../../generated/prisma";

export async function seedRolesAndPermissions(
  tenants: Tenant[],
  subsidiaries: Subsidiary[],
  allowedActionsSeed: AllowedAction[]
) {
  console.log("\n🚀 Seeding SuperAdmin and Admin roles with permissions...");

  // 👉 Lee AllowedActions completos para filtrar por nombre de acción
  const allowedActions = await prisma.allowedAction.findMany({
    include: { action: true },
  });

  const rolesBySubsidiary: Record<string, Record<string, any>> = {};

  for (const subsidiary of subsidiaries) {
    const { tenantId, id: subsidiaryId } = subsidiary;

    if (!rolesBySubsidiary[subsidiaryId]) {
      rolesBySubsidiary[subsidiaryId] = {};
    }

    // === SuperAdmin ===
    const superAdminRole = await prisma.role.create({
      data: {
        name: "Super.Admin",
        description: "Super admin with ALL permissions",
        tenantId,
        subsidiaryId,
      },
    });

    const superAdminPermissions = allowedActions.map((allowed) => ({
      roleId: superAdminRole.id,
      actionId: allowed.actionId,
      moduleId: allowed.moduleId ?? null,
      submoduleId: allowed.submoduleId ?? null,
      tenantId,
      subsidiaryId,
      compositeKey: `${superAdminRole.id}_${allowed.actionId}_${allowed.moduleId || ''}_${allowed.submoduleId || ''}`,
    }));

    await prisma.rolePermission.createMany({
      data: superAdminPermissions,
      skipDuplicates: true,
    });

    console.log(`✅ Super.Admin created for Subsidiary ${subsidiaryId} with ${superAdminPermissions.length} permissions`);

    rolesBySubsidiary[subsidiaryId]["Super.Admin"] = superAdminRole;

    // === Admin ===
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        description: "Admin with limited permissions",
        tenantId,
        subsidiaryId,
      },
    });

    const adminPermissions = allowedActions
      .filter((allowed) =>
        !["eliminar", "exportar"].includes(allowed.action.name.toLowerCase())
      )
      .map((allowed) => ({
        roleId: adminRole.id,
        actionId: allowed.actionId,
        moduleId: allowed.moduleId ?? null,
        submoduleId: allowed.submoduleId ?? null,
        tenantId,
        subsidiaryId,
        compositeKey: `${adminRole.id}_${allowed.actionId}_${allowed.moduleId || ''}_${allowed.submoduleId || ''}`,
      }));

    await prisma.rolePermission.createMany({
      data: adminPermissions,
      skipDuplicates: true,
    });

    console.log(`✅ Admin created for Subsidiary ${subsidiaryId} with ${adminPermissions.length} permissions`);

    rolesBySubsidiary[subsidiaryId]["Admin"] = adminRole;
  }

  console.log("🎉 Roles and RolePermissions seeding completed.\n");
  return rolesBySubsidiary;
}
