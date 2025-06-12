import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";

// Tipado para los roles agrupados por subsidiary
type RoleMap = Record<string, { id: string; tenantId: string }>;
type RolesBySubsidiary = Record<string, RoleMap>;

export async function seedRolePermissions(
  rolesBySubsidiary: RolesBySubsidiary,
  actions: any[],
  sections: any[],
  modules: any[],
  submodules: any[]
) {
  console.log("⏳ Seeding role permissions...");

  const getActionId = (name: string) =>
    actions.find((a) => normalize(a.name) === normalize(name))?.id;

  const A = {
    ver: getActionId("ver"),
    crear: getActionId("crear"),
    editar: getActionId("editar"),
    estado: getActionId("estado"),
    exportar: getActionId("exportar"),
    eliminar: getActionId("eliminar"),
  };

  const allPermissions: any[] = [];

  const normalizeId = (val: any) =>
    val === undefined || val === null || val === "" ? null : val;

  for (const [_, roleMap] of Object.entries(rolesBySubsidiary)) {
    for (const [roleNameRaw, role] of Object.entries(roleMap)) {
      const roleName = normalize(roleNameRaw);
      const tenantId = role.tenantId;

      const allowedSections = sections.filter((section) => {
        const name = normalize(section.name);
        if (roleName === "super.admin") return name !== "administracion";
        if (roleName === "admin") return !["administracion", "reportes"].includes(name);
        if (roleName === "vendedor") return ["ventas", "almacen"].includes(name);
        if (roleName === "almacen") return name === "almacen";
        return false;
      });

      const allowedActions =
        roleName === "super.admin"
          ? Object.values(A).filter((id) => id && id !== A.eliminar)
          : roleName === "admin"
          ? [A.ver, A.crear, A.editar, A.estado]
          : roleName === "vendedor"
          ? [A.ver, A.crear]
          : roleName === "almacen"
          ? [A.ver, A.crear, A.editar, A.estado]
          : [];

      for (const section of allowedSections) {
        const sectionModules = modules.filter((m) => m.sectionId === section.id);
        const sectionSubmodules = submodules.filter((sm) =>
          sectionModules.some((m) => m.id === sm.moduleId)
        );

        // Sección directamente
        for (const actionId of allowedActions) {
          allPermissions.push({
            roleId: role.id,
            tenantId,
            sectionId: section.id,
            moduleId: null,
            submoduleId: null,
            actionId,
          });
        }

        // Módulos
        for (const mod of sectionModules) {
          for (const actionId of allowedActions) {
            allPermissions.push({
              roleId: role.id,
              tenantId,
              sectionId: section.id,
              moduleId: normalizeId(mod.id),
              submoduleId: null,
              actionId,
            });
          }
        }

        // Submódulos
        for (const sm of sectionSubmodules) {
          for (const actionId of allowedActions) {
            allPermissions.push({
              roleId: role.id,
              tenantId,
              sectionId: section.id,
              moduleId: normalizeId(sm.moduleId),
              submoduleId: normalizeId(sm.id),
              actionId,
            });
          }
        }
      }
    }
  }

  // ✅ Inserción y conteo de duplicados
  const before = await prisma.rolePermission.count();
  await prisma.rolePermission.createMany({
    data: allPermissions,
    skipDuplicates: true,
  });
  const after = await prisma.rolePermission.count();
  const inserted = after - before;
  const skipped = allPermissions.length - inserted;

  console.log(`✅ ${inserted} permissions inserted, ${skipped} skipped (already existed).`);
  return { inserted, skipped };
}
