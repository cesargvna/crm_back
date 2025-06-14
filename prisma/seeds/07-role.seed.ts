import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";

type Subsidiary = {
  id: string;
  name: string;
  tenantId: string;
};

export async function seedRoles(tenants: any[], subsidiaries: Subsidiary[]) {
  console.log("⏳ Seeding roles...");

  const rolesBySubsidiary: Record<string, Record<string, any>> = {};

  const roleTemplates = [
    {
      name: "super.admin",
      description: "Rol con acceso completo (excepto administración y eliminar)",
    },
    {
      name: "admin",
      description: "Administrador con permisos limitados",
    },
    {
      name: "vendedor",
      description: "Encargado de ventas, caja y cotizaciones",
    },
    {
      name: "almacen",
      description: "Gestión de inventario y productos",
    },
  ];

  for (const subsidiary of subsidiaries) {
    const roleMap: Record<string, any> = {};

    for (const role of roleTemplates) {
      const normalizedName = normalize(role.name.trim());

      const existing = await prisma.role.findFirst({
        where: {
          name: { equals: normalizedName, mode: "insensitive" },
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      if (existing) {
        console.log(`⚠️ Rol "${normalizedName}" ya existe en "${subsidiary.name}"`);
        roleMap[normalizedName] = existing;
        continue;
      }

      const created = await prisma.role.create({
        data: {
          name: normalizedName,
          description: role.description,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      console.log(`✅ Rol "${created.name}" creado para "${subsidiary.name}"`);
      roleMap[normalizedName] = created;
    }

    rolesBySubsidiary[subsidiary.id] = roleMap;
  }

  return rolesBySubsidiary;
}
