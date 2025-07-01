// ✅ src/controllers/rolePermission.controller.ts
import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 👉 Crear asignación de permiso
export const createRolePermission = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;  // <- Ahora viene por URL
  const { actionId, moduleId, submoduleId, tenantId, subsidiaryId } = req.body;

  const compositeKey = `${roleId}_${actionId}_${moduleId || "null"}_${submoduleId || "null"}`;

  const exists = await prisma.rolePermission.findUnique({
    where: { compositeKey },
  });

  if (exists) {
    return res.status(409).json({ message: "This permission is already assigned to the role." });
  }

  const created = await prisma.rolePermission.create({
    data: {
      roleId,
      actionId,
      moduleId,
      submoduleId,
      tenantId,
      subsidiaryId,
      compositeKey,
    },
  });

  res.status(201).json(created);
});

// 👉 Obtener permisos por rol, tenant o subsidiary
export const getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
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

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  // 🔑 Estructura tipo sidebar
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
      hierarchy[sectionName][moduleName][submoduleName].push({
        id: rp.id,    // 🔥 ID del RolePermission
        action: actionName,
      });
    } else {
      if (!hierarchy[sectionName][moduleName].actions) {
        hierarchy[sectionName][moduleName].actions = [];
      }
      hierarchy[sectionName][moduleName].actions.push({
        id: rp.id,    // 🔥 ID del RolePermission
        action: actionName,
      });
    }
  }

  // 🔥 Respuesta clara con datos del rol
  res.json({
    roleId: role.id,
    roleName: role.name,
    roleStatus: role.status,
    permissions: hierarchy,
  });
});

// 👉 Eliminar asignación de permiso
export const deleteRolePermission = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const exists = await prisma.rolePermission.findUnique({ where: { id } });
  if (!exists) {
    return res.status(404).json({ message: "Role permission not found." });
  }

  await prisma.rolePermission.delete({ where: { id } });

  res.json({ message: "Permission assignment deleted successfully." });
});
