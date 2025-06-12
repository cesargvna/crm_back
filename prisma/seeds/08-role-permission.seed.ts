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

  for (const [subsidiaryId, roleMap] of Object.entries(rolesBySubsidiary)) {
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

        // Permisos sobre la sección directamente
        for (const actionId of allowedActions) {
          allPermissions.push({
            roleId: role.id,
            tenantId,
            sectionId: section.id,
            moduleId: undefined,
            submoduleId: undefined,
            actionId,
          });
        }

        // Permisos sobre los módulos
        for (const mod of sectionModules) {
          for (const actionId of allowedActions) {
            allPermissions.push({
              roleId: role.id,
              tenantId,
              sectionId: section.id,
              moduleId: mod.id,
              submoduleId: undefined,
              actionId,
            });
          }
        }

        // Permisos sobre los submódulos
        for (const sm of sectionSubmodules) {
          for (const actionId of allowedActions) {
            allPermissions.push({
              roleId: role.id,
              tenantId,
              sectionId: section.id,
              moduleId: sm.moduleId,
              submoduleId: sm.id,
              actionId,
            });
          }
        }
      }
    }
  }

  await prisma.rolePermission.createMany({
    data: allPermissions,
    skipDuplicates: true,
  });

  console.log(`✅ Se asignaron ${allPermissions.length} permisos (evitando duplicados)`);
  return allPermissions;
}
