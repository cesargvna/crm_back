import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear una nueva asignación de permiso
export const createRolePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId, actionId, sectionId, moduleId, submoduleId } = req.body;

    // ✅ 1. Verificamos que exista el rol
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    // ✅ 2. Obtenemos el tenant manualmente desde el rol
    const tenantId = role.tenantId;

    // ✅ 3. Validar duplicidad del permiso
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId, actionId, sectionId, moduleId, submoduleId },
    });

    if (existing) {
      return res.status(409).json({
        message: "Permission already assigned to this role.",
      });
    }

    // ✅ 4. Crear permiso
    const newPermission = await prisma.rolePermission.create({
      data: {
        roleId,
        actionId,
        sectionId,
        moduleId,
        submoduleId,
        tenantId,
      },
    });

    res.status(201).json(newPermission);
  }
);

// ✅ Obtener permisos por ID de rol (con tenant, subsidiary y rol info)
export const getRolePermissionsByRoleId = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId } = req.params;

    // 1. Buscar el rol (con sus permisos, acción y sección)
    const role = await prisma.role.findUnique({
      where: { id: roleId },
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
      return res.status(404).json({ message: "Role not found." });
    }

    // 2. Obtener manualmente la subsidiary
    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id: role.subsidiaryId },
      select: {
        id: true,
        name: true,
      },
    });

    // 3. Obtener manualmente el tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: role.tenantId },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    // 4. Construir respuesta
    res.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      subsidiary,
      tenant,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.id,
        action: rp.action,
        section: rp.section,
        moduleId: rp.moduleId,
        submoduleId: rp.submoduleId,
      })),
    });
  }
);

// ✅ Eliminar permiso por ID
export const deleteRolePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // 1. Buscar el permiso con su rol relacionado
    const existing = await prisma.rolePermission.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "RolePermission not found." });
    }

    // ✅ Puedes validar tenant si quieres:
    // const tenantId = existing.role.tenantId;
    // Aquí puedes hacer más validaciones si necesitas

    // 2. Eliminar
    const deleted = await prisma.rolePermission.delete({
      where: { id },
    });

    res.json({
      message: "Permission removed from role successfully.",
      deleted,
    });
  }
);