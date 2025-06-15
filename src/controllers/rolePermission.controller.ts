import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear una nueva asignación de permiso
export const createRolePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId, actionId, sectionId, moduleId, submoduleId } = req.body;

    // ✅ 1. Obtener información del rol
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    const tenantId = role.tenantId;
    const subsidiaryId = role.subsidiaryId;

    // ✅ 2. Normalizar campos opcionales
    const normalize = (val: any) =>
      val === undefined || val === null || val === "" ? null : val;

    const normalizedModuleId = normalize(moduleId);
    const normalizedSubmoduleId = normalize(submoduleId);

    // ✅ 3. Crear compositeKey única
    const compositeKey = `${roleId}-${actionId}-${sectionId}-${
      normalizedModuleId ?? "null"
    }-${normalizedSubmoduleId ?? "null"}`;

    // ✅ 4. Verificar duplicado por compositeKey
    const existing = await prisma.rolePermission.findUnique({
      where: { compositeKey },
    });

    if (existing) {
      return res.status(409).json({
        message: "This permission is already assigned to the role.",
      });
    }

    // ✅ 5. Crear nuevo permiso
    const newPermission = await prisma.rolePermission.create({
      data: {
        roleId,
        actionId,
        sectionId,
        moduleId: normalizedModuleId,
        submoduleId: normalizedSubmoduleId,
        tenantId,
        subsidiaryId,
        compositeKey,
      },
    });

    return res.status(201).json(newPermission);
  }
);

// ✅ Obtener permisos por ID de rol (con tenant, subsidiary y rol info)
export const getRolePermissionsByRoleId = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId } = req.params;

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

    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id: role.subsidiaryId },
      select: { id: true, name: true },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: role.tenantId },
      select: { id: true, name: true, description: true },
    });

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
        compositeKey: rp.compositeKey,
      })),
    });
  }
);

export const getRolePermissionsByTenantId = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = req.params;

    const permissions = await prisma.rolePermission.findMany({
      where: { tenantId },
      include: {
        action: true,
        section: true,
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    res.json({
      tenantId,
      total: permissions.length,
      permissions: permissions.map((rp) => ({
        id: rp.id,
        action: rp.action,
        section: rp.section,
        moduleId: rp.moduleId,
        submoduleId: rp.submoduleId,
        compositeKey: rp.compositeKey,
        role: rp.role,
        subsidiaryId: rp.subsidiaryId,
      })),
    });
  }
);

export const getRolePermissionsBySubsidiaryId = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    const permissions = await prisma.rolePermission.findMany({
      where: { subsidiaryId },
      include: {
        action: true,
        section: true,
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    res.json({
      subsidiaryId,
      total: permissions.length,
      permissions: permissions.map((rp) => ({
        id: rp.id,
        action: rp.action,
        section: rp.section,
        moduleId: rp.moduleId,
        submoduleId: rp.submoduleId,
        compositeKey: rp.compositeKey,
        role: rp.role,
        tenantId: rp.tenantId,
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
        action: true,
        section: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "RolePermission not found." });
    }

    // 2. Eliminar
    await prisma.rolePermission.delete({
      where: { id },
    });

    // 3. Respuesta con detalle del permiso eliminado
    res.json({
      message: "Permission removed from role successfully.",
      deleted: {
        id: existing.id,
        role: {
          id: existing.role.id,
          name: existing.role.name,
        },
        action: existing.action,
        section: existing.section,
        moduleId: existing.moduleId,
        submoduleId: existing.submoduleId,
        tenantId: existing.tenantId,
        subsidiaryId: existing.subsidiaryId,
        compositeKey: existing.compositeKey,
      },
    });
  }
);
