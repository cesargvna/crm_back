import { Request, Response } from "express";
import prisma from "../utils/prisma";

import { asyncHandler } from "../utils/asyncHandler";

// ✅ Normalizador final
export function normalizeRoleName(name: string) {
  return name
    .toLowerCase()                      
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")    
    .replace(/ñ/g, "n")                 
    .replace(/[^a-z.]/g, "")            
    .trim();
}

// ✅ Crear rol
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizeRoleName(name);

  const subsidiary = await prisma.subsidiary.findUnique({ where: { id: subsidiaryId } });
  if (!subsidiary || subsidiary.tenantId !== tenantId) {
    return res.status(400).json({ message: "The selected subsidiary does not belong to the specified tenant." });
  }

  const exists = await prisma.role.findFirst({
    where: { name: normalizedName, tenantId, subsidiaryId },
  });

  if (exists) {
    return res.status(409).json({
      message: `A role with the name "${normalizedName}" already exists in this tenant and subsidiary.`,
    });
  }

  const role = await prisma.role.create({
    data: {
      name: normalizedName,
      description: description?.trim() || null, // Permite todo, solo trim y null
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json(role);
});

// ✅ Update rol
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const normalizedName = normalizeRoleName(name);

  const existingRole = await prisma.role.findUnique({ where: { id } });
  if (!existingRole) {
    return res.status(404).json({ message: "Role not found" });
  }

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
        message: `Another role with the name "${normalizedName}" already exists in this tenant and subsidiary.`,
      });
    }
  }

  const updated = await prisma.role.update({
    where: { id },
    data: {
      name: normalizedName,
      description: description?.trim() || null, // Sin normalización
    },
  });

  res.json(updated);
});

// 🔑 Toggle status
export const toggleRoleStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  const newStatus = !role.status;

  await prisma.role.update({
    where: { id },
    data: { status: newStatus },
  });

  // Si User.tenantId puede ser null
  const userWhere: any = {
    roleId: id,
    subsidiaryId: role.subsidiaryId,
  };
  if (role.tenantId) userWhere.tenantId = role.tenantId;

  await prisma.user.updateMany({
    where: userWhere,
    data: { status: newStatus },
  });

  res.json({
    id: role.id,
    name: role.name,  // ✅ Nombre del rol
    newStatus,        // ✅ Nuevo estado booleano
    message: `Role ${newStatus ? "enabled" : "disabled"} successfully.`,
    detail: `All users assigned to the role "${role.name}" have also been ${newStatus ? "enabled" : "disabled"}.`,
  });
});

// 🔑 Obtener rol con permisos jerárquicos
export const getRoleWithPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: {
          action: true,
          module: { include: { section: true } },
          submodule: { include: { module: { include: { section: true } } } },
        },
      },
    },
  });

  if (!role) return res.status(404).json({ message: "Role not found" });

  // Construir estructura jerárquica: Section -> Module -> Submodule -> Actions
  const hierarchy: Record<string, any> = {};

  for (const rp of role.rolePermissions) {
    const sectionName = rp.module?.section?.name || rp.submodule?.module?.section?.name || "Unassigned";
    const moduleName = rp.module?.name || rp.submodule?.module?.name || "Unassigned";
    const submoduleName = rp.submodule?.name || null;
    const actionName = rp.action.name;

    if (!hierarchy[sectionName]) {
      hierarchy[sectionName] = {};
    }

    if (!hierarchy[sectionName][moduleName]) {
      hierarchy[sectionName][moduleName] = {};
    }

    if (submoduleName) {
      if (!hierarchy[sectionName][moduleName][submoduleName]) {
        hierarchy[sectionName][moduleName][submoduleName] = [];
      }
      hierarchy[sectionName][moduleName][submoduleName].push(actionName);
    } else {
      if (!hierarchy[sectionName][moduleName].actions) {
        hierarchy[sectionName][moduleName].actions = [];
      }
      hierarchy[sectionName][moduleName].actions.push(actionName);
    }
  }

  res.json({
    id: role.id,
    name: role.name,
    status: role.status,
    permissions: hierarchy,
  });
});


// 🔑 Roles activos por Subsidiary (simple)
export const getRolesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;
  const roles = await prisma.role.findMany({
    where: { subsidiaryId, status: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  res.json(roles);
});

// 🔑 Roles completos por Subsidiary
export const getRolesBySubsidiaryComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      status = "all",
      orderBy = "name",
      sort = "asc",
    } = req.query;

    const take = Math.min(parseInt(limit as string), 100);
    const skip = (parseInt(page as string) - 1) * take;

    const filters: any = {
      subsidiaryId,
      name: { contains: search as string, mode: "insensitive" },
    };
    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    // ✅ Trae módulos, submódulos y section correctamente
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
              module: {
                select: {
                  name: true,
                  section: {
                    select: { name: true },
                  },
                },
              },
              submodule: {
                select: {
                  name: true,
                  module: {
                    select: {
                      name: true,
                      section: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.role.count({ where: filters }),
    ]);

    const rolesWithUserPermissions = roles.map((role) => ({
      ...role,
      users: role.users.map((u) => ({
        ...u,
        permissions: role.rolePermissions.map((rp) => ({
          action: rp.action.name,
          module: rp.module?.name ?? rp.submodule?.module?.name ?? null,
          submodule: rp.submodule?.name ?? null,
          section:
            rp.module?.section?.name ??
            rp.submodule?.module?.section?.name ??
            null,
        })),
      })),
    }));

    const tenantInfo = roles.length
      ? await prisma.tenant.findUnique({
          where: { id: roles[0].tenantId },
          select: { id: true, name: true, description: true },
        })
      : null;

    res.json({
      total,
      page: Number(page),
      limit: take,
      tenant: tenantInfo,
      data: rolesWithUserPermissions,
    });
  }
);

// 🔑 Obtener rol por ID (extendido)
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      users: true,
      rolePermissions: {
        include: {
          action: true,
          module: {
            include: {
              section: true, // ✅ desde module
            },
          },
          submodule: true,
        },
      },
    },
  });

  if (!role) return res.status(404).json({ message: "Role not found" });

  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: role.subsidiaryId },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: role.tenantId },
  });

  // 🔄 Normalizar la respuesta si quieres
  const enrichedPermissions = role.rolePermissions.map((rp) => ({
    id: rp.id,
    action: rp.action.name,
    module: rp.module?.name ?? null,
    submodule: rp.submodule?.name ?? null,
    section: rp.module?.section?.name ?? null, // ✅ se obtiene desde module
  }));

  res.json({
    role: {
      id: role.id,
      name: role.name,
      status: role.status,
      description: role.description,
    },
    permissions: enrichedPermissions,
    subsidiary,
    tenant,
    users: role.users,
  });
});

// 🔑 Roles por Tenant con Subsidiaries
export const getRolesByTenant = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, description: true },
  });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  const subsidiaries = await prisma.subsidiary.findMany({
    where: { tenantId },
    select: { id: true, name: true },
  });

  const subsidiariesWithRoles = await Promise.all(
    subsidiaries.map(async (subsidiary) => {
      const roles = await prisma.role.findMany({
        where: { subsidiaryId: subsidiary.id },
        include: {
          rolePermissions: {
            include: {
              action: { select: { name: true } },
              // ❌ section no existe directamente => se obtiene manualmente después
            },
          },
        },
      });

      const simplifiedRoles = await Promise.all(
        roles.map(async (role) => {
          const permissions = await Promise.all(
            role.rolePermissions.map(async (rp) => {
              const moduleName = rp.moduleId
                ? (
                    await prisma.module.findUnique({
                      where: { id: rp.moduleId },
                      select: { name: true },
                    })
                  )?.name
                : null;

              const submoduleName = rp.submoduleId
                ? (
                    await prisma.submodule.findUnique({
                      where: { id: rp.submoduleId },
                      select: { name: true },
                    })
                  )?.name
                : null;

              // ✅ Resolver Section: puede venir del module o del submodule
              let sectionName: string | null = null;

              if (rp.moduleId) {
                const module = await prisma.module.findUnique({
                  where: { id: rp.moduleId },
                  include: { section: { select: { name: true } } },
                });
                sectionName = module?.section?.name ?? null;
              } else if (rp.submoduleId) {
                const submodule = await prisma.submodule.findUnique({
                  where: { id: rp.submoduleId },
                  include: {
                    module: {
                      include: { section: { select: { name: true } } },
                    },
                  },
                });
                sectionName = submodule?.module?.section?.name ?? null;
              }

              return {
                action: rp.action.name,
                section: sectionName,
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

  res.json({ tenant, subsidiaries: subsidiariesWithRoles });
});