import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const seedRoles = async () => {
  const tenants = await prisma.tenant.findMany();
  const actions = await prisma.permissionAction.findMany();
  const sections = await prisma.permissionSection.findMany();

  for (const tenant of tenants) {
    const roles = [
      { name: "super.admin", description: "Rol con todos los permisos" },
      { name: "admin", description: "Administrador general" },
      { name: "cajero", description: "Encargado de caja y ventas" },
      { name: "almacen", description: "Responsable de inventario y productos" },
    ];

    for (const role of roles) {
      const exists = await prisma.role.findFirst({
        where: {
          name: role.name,
          tenantId: tenant.id,
        },
      });

      if (exists) {
        console.log(`⏩ Role already exists: ${role.name} (${tenant.name})`);
        continue;
      }

      const newRole = await prisma.role.create({
        data: {
          id: uuidv4(),
          name: role.name,
          description: role.description,
          tenantId: tenant.id,
        },
      });

      // Si es super.admin → asignar todos los permisos
      if (role.name === "super.admin") {
        const permissions = sections.flatMap((section) =>
          actions.map((action) => ({
            id: uuidv4(),
            sectionId: section.id,
            actionId: action.id,
            roleId: newRole.id,
            tenantId: tenant.id,
          }))
        );

        await prisma.rolePermission.createMany({
          data: permissions,
        });

        console.log(`✅ Permissions assigned to super.admin (${tenant.name})`);
      }

      console.log(`✅ Role created: ${role.name} (${tenant.name})`);
    }
  }
};
