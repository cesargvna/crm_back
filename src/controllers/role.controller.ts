import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import normalize from "normalize-text";
import { asyncHandler } from "../utils/asyncHandler";

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, tenantId, subsidiaryId } = req.body;

  // 🔠 Normalizar el nombre del rol
  const normalizedName = normalize(name).toLowerCase();

  // 🏢 Validar que la sucursal pertenezca al tenant
  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: subsidiaryId },
  });

  if (!subsidiary || subsidiary.tenantId !== tenantId) {
    return res.status(400).json({
      message: "The selected subsidiary does not belong to the specified tenant.",
    });
  }

  // 🔁 Verificar si ya existe un rol con el mismo nombre normalizado
  const existing = await prisma.role.findFirst({
    where: {
      name: normalizedName,
      tenantId,
      subsidiaryId,
    },
  });

  if (existing) {
    return res.status(409).json({
      message: "A role with the same name already exists in this tenant and subsidiary.",
    });
  }

  // ✅ Crear el nuevo rol
  const role = await prisma.role.create({
    data: {
      name: normalizedName,
      description,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json(role);
});

// ✅ Actualizar rol
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // 🔠 Normalizar el nombre del rol
  const normalizedName = normalize(name).toLowerCase();

  // 🆔 Verificar que el rol exista
  const existingRole = await prisma.role.findUnique({ where: { id } });

  if (!existingRole) {
    return res.status(404).json({ message: "Role not found" });
  }

  // 🟨 Verificar duplicados si el nombre cambia
  if (normalizedName !== existingRole.name) {
    const duplicate = await prisma.role.findFirst({
      where: {
        name: normalizedName,
        tenantId: existingRole.tenantId,
        subsidiaryId: existingRole.subsidiaryId,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another role with the same name already exists in this tenant and subsidiary.",
      });
    }
  }

  // ✏️ Actualizar el rol
  const role = await prisma.role.update({
    where: { id },
    data: {
      name: normalizedName,
      description,
    },
  });

  res.json(role);
});

// ✅ Cambiar estado del rol automáticamente (toggle sin body)
export const toggleRoleStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1. Obtener el rol
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    // 2. Invertir el estado actual
    const newStatus = !existingRole.status;

    // 3. Actualizar el rol
    await prisma.role.update({
      where: { id },
      data: { status: newStatus },
    });

    // 4. Actualizar usuarios relacionados
    await prisma.user.updateMany({
      where: {
        roleId: id,
        tenantId: existingRole.tenantId,
        subsidiaryId: existingRole.subsidiaryId,
      },
      data: { status: newStatus },
    });

    // 5. Respuesta clara
    res.json({
      message: `Role ${newStatus ? "enabled" : "disabled"} successfully.`,
      detail: `All users assigned to this role have also been ${newStatus ? "enabled" : "disabled"}.`,
    });
  }
);

// ✅ Obtener rol por ID con permisos
export const getRoleWithPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            action: true,
            section: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // 🔄 Enriquecer con nombre de módulo y submódulo
    const enrichedPermissions = await Promise.all(
      role.rolePermissions.map(async (rp) => {
        const moduleName = rp.moduleId
          ? (
              await prisma.moduleGroup.findUnique({
                where: { id: rp.moduleId },
                select: { name: true },
              })
            )?.name
          : null;

        const submoduleName = rp.submoduleId
          ? (
              await prisma.submoduleGroup.findUnique({
                where: { id: rp.submoduleId },
                select: { name: true },
              })
            )?.name
          : null;

        return {
          id: rp.id,
          action: rp.action.name,
          section: rp.section.name,
          module: moduleName,
          submodule: submoduleName,
        };
      })
    );

    res.json({
      id: role.id,
      name: role.name,
      status: role.status,
      permissions: enrichedPermissions,
    });
  }
);

export const getRolesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    const roles = await prisma.role.findMany({
      where: {
        subsidiaryId,
        status: true, // solo roles activos
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    res.json(roles); // Ej: [{ id: "...", name: "Admin" }]
  }
);

// ✅ Obtener roles por ID de SUBSIDIARY
export const getRolesBySubsidiaryComplete = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const {
    page = "1",
    limit = "10",
    search = "",
    status = "all",
    orderBy = "name",
    sort = "asc",
  } = req.query;

  const take = Math.min(parseInt(limit as string), 100);
  const skip = (parseInt(page as string) - 1) * take;

  const filters: any = {
    subsidiaryId,
    name: {
      contains: search as string,
      mode: "insensitive",
    },
  };

  if (status === "true" || status === "false") {
    filters.status = status === "true";
  }

  // 1. Obtener roles con usuarios y permisos
  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where: filters,
      orderBy: { [orderBy as string]: sort },
      skip,
      take,
      include: {
        users: true,
        rolePermissions: {
          include: {
            action: true,
            section: true,
          },
        },
      },
    }),
    prisma.role.count({ where: filters }),
  ]);

  // 2. Agregar permisos a cada usuario desde los permisos del rol
  const rolesWithUserPermissions = roles.map((role) => {
    const permissions = role.rolePermissions.map((rp) => ({
      action: rp.action,
      section: rp.section,
    }));

    const usersWithPermissions = role.users.map((user) => ({
      ...user,
      permissions,
    }));

    return {
      ...role,
      users: usersWithPermissions,
    };
  });

  // 3. Obtener datos del tenant
  let tenantInfo = null;
  if (roles.length > 0) {
    tenantInfo = await prisma.tenant.findUnique({
      where: { id: roles[0].tenantId },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  res.json({
    total,
    page: Number(page),
    limit: take,
    tenant: tenantInfo,
    data: rolesWithUserPermissions,
  });
});

// ✅ Obtener rol por ID con info extendida (subsidiary, tenant, users y permisos)
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Buscar rol
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: {
          action: true,
          section: true,
        },
      },
      users: true, // Usuarios ligados a este rol
    },
  });

  if (!role) return res.status(404).json({ message: 'Role not found' });

  // 2. Buscar manualmente la subsidiary
  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: role.subsidiaryId },
  });

  // 3. Buscar manualmente el tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: role.tenantId },
  });

  res.json({
    role,
    subsidiary,
    tenant,
    users: role.users,
  });
}); 

export const getRolesByTenant = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  // 1. Verificar tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, description: true },
  });

  if (!tenant) {
    return res.status(404).json({ message: "Tenant not found" });
  }

  // 2. Obtener sucursales
  const subsidiaries = await prisma.subsidiary.findMany({
    where: { tenantId },
    select: { id: true, name: true },
  });

  // 3. Obtener roles por sucursal
  const subsidiariesWithRoles = await Promise.all(
    subsidiaries.map(async (subsidiary) => {
      const roles = await prisma.role.findMany({
        where: { subsidiaryId: subsidiary.id },
        include: {
          rolePermissions: {
            include: {
              action: { select: { name: true } },
              section: { select: { name: true } },
            },
          },
        },
      });

      // 4. Resolver nombres de moduleId y submoduleId manualmente
      const simplifiedRoles = await Promise.all(
        roles.map(async (role) => {
          const permissions = await Promise.all(
            role.rolePermissions.map(async (rp) => {
              const moduleName = rp.moduleId
                ? (
                    await prisma.moduleGroup.findUnique({
                      where: { id: rp.moduleId },
                      select: { name: true },
                    })
                  )?.name
                : null;

              const submoduleName = rp.submoduleId
                ? (
                    await prisma.submoduleGroup.findUnique({
                      where: { id: rp.submoduleId },
                      select: { name: true },
                    })
                  )?.name
                : null;

              return {
                action: rp.action.name,
                section: rp.section.name,
                module: moduleName,
                submodule: submoduleName,
              };
            })
          );

          return {
            name: role.name,
            status: role.status,
            permissions,
          };
        })
      );

      return {
        name: subsidiary.name,
        roles: simplifiedRoles,
      };
    })
  );

  // 5. Responder
  res.json({
    tenant,
    subsidiaries: subsidiariesWithRoles,
  });
});