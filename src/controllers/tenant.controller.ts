// src/controllers/tenant.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import normalize from "normalize-text";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear Tenant
export const createTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const normalized = normalize(name.trim());

    const exists = await prisma.tenant.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
      },
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: `Tenant "${name}" already exists.` });
    }

    const created = await prisma.tenant.create({
      data: {
        name: normalized,
        description,
      },
    });

    res.status(201).json(created);
  }
);

// ✅ Actualizar Tenant
export const updateTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const normalized = normalize(name.trim());

    const existing = await prisma.tenant.findFirst({
      where: {
        id: { not: id },
        name: { equals: normalized, mode: "insensitive" },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: `Tenant "${name}" already exists.` });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        name: normalized,
        description,
      },
    });

    res.json(updated);
  }
);

// ✅ Cambiar estado (activar/desactivar)
export const toggleTenantStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const newStatus = !tenant.status;

    // ✅ Actualizar estado del tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { status: newStatus },
    });

    // ✅ Actualizar estado de entidades relacionadas
    await Promise.all([
      prisma.user.updateMany({
        where: { tenantId: id },
        data: { status: newStatus },
      }),
      prisma.subsidiary.updateMany({
        where: { tenantId: id },
        data: { status: newStatus },
      }),
      prisma.role.updateMany({
        where: { tenantId: id },
        data: { status: newStatus },
      }),
    ]);

    // ✅ Respuesta clara para Postman
    res.json({
      message: `Tenant status updated to ${newStatus ? "active" : "inactive"}`,
      updated: {
        tenantStatus: newStatus,
        affectedEntities: {
          users: `All users under tenant set to ${newStatus}`,
          subsidiaries: `All subsidiaries under tenant set to ${newStatus}`,
          roles: `All roles under tenant set to ${newStatus}`,
        },
      },
      tenant: updatedTenant,
    });
  }
);
// ✅ Obtener todos los tenants (paginado + filtros + búsqueda + sucursales)
export const getAllTenants = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "5",
      search = "",
      status = "all",
      orderBy = "name",
      sort = "asc",
    } = req.query;

    const take = Math.min(parseInt(limit as string), 1000);
    const skip = (parseInt(page as string) - 1) * take;

    const filters: any = {
      OR: [
        {
          name: {
            contains: normalize(search as string),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search as string,
            mode: "insensitive",
          },
        },
      ],
    };

    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where: filters,
        orderBy: { [orderBy as string]: sort },
        skip,
        take,
        include: {
          subsidiaries: true, // ✅ Agregado: incluir sucursales
        },
      }),
      prisma.tenant.count({ where: filters }),
    ]);

    res.json({ total, page: Number(page), limit: take, data });
  }
);

// ✅ Eliminar tenant (con conteo de datos relacionados)
export const deleteTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // 🔍 Contar relaciones antes de eliminar
    const [users, roles, subsidiaries] = await Promise.all([
      prisma.user.count({ where: { tenantId: id } }),
      prisma.role.count({ where: { tenantId: id } }),
      prisma.subsidiary.count({ where: { tenantId: id } }),
    ]);

    console.log(`Preparing to delete tenant: ${tenant.name}`);
    console.log(
      `Related data: ${users} users, ${roles} roles, ${subsidiaries} subsidiaries`
    );

    // 🗑️ Eliminar tenant (cascada eliminará todo lo relacionado)
    await prisma.tenant.delete({ where: { id } });

    console.log(`Tenant "${tenant.name}" and related data deleted.`);

    res.json({
      message: `Tenant "${tenant.name}" and related data deleted successfully.`,
      deletedRelations: {
        users,
        roles,
        subsidiaries,
      },
    });
  }
);

// ✅ Obtener Tenant con todos los detalles (con usuarios y roles separados)
export const getTenantById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // 1. Traer todas las sucursales del tenant
    const subsidiaries = await prisma.subsidiary.findMany({
      where: { tenantId: id },
      include: {
        schedulesSubsidiaries: true,
        users: {
          include: {
            schedulesUsers: true,
            role: true,
          },
        },
      },
    });

    // 2. Traer todos los roles del tenant
    const allRoles = await prisma.role.findMany({
      where: { tenantId: id },
      include: {
        rolePermissions: {
          include: {
            action: true,
            section: true,
          },
        },
      },
    });

    // 3. Enlazar manualmente los roles por sucursal
    const subsidiariesWithRoles = subsidiaries.map((subsidiary) => {
      const rolesForSubsidiary = allRoles.filter(
        (role) => role.subsidiaryId === subsidiary.id
      );

      return {
        ...subsidiary,
        roles: rolesForSubsidiary,
      };
    });

    res.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        description: tenant.description,
        status: tenant.status,
        created_at: tenant.created_at,
        updated_at: tenant.updated_at,
      },
      subsidiaries: subsidiariesWithRoles,
    });
  }
);
