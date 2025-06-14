import { Request, Response } from "express";
import prisma from "../utils/prisma";
import normalize from "normalize-text";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear Subsidiary
export const createSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      subsidiary_type,
      tenantId,
      allowNegativeStock,
      ci,
      nit,
      description,
      address,
      city,
      country,
      cellphone,
      telephone,
      email,
    } = req.body;

    const normalized = normalize(name.trim());

    const exists = await prisma.subsidiary.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
        tenantId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message: `Subsidiary "${name}" already exists in this tenant.`,
      });
    }

    const created = await prisma.subsidiary.create({
      data: {
        name: normalized,
        subsidiary_type,
        tenantId,
        allowNegativeStock,
        ci,
        nit,
        description,
        address,
        city,
        country,
        cellphone,
        telephone,
        email,
      },
    });

    res.status(201).json(created);
  }
);

// ✅ Actualizar Subsidiary
export const updateSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      subsidiary_type,
      allowNegativeStock,
      ci,
      nit,
      description,
      address,
      city,
      country,
      cellphone,
      telephone,
      email,
    } = req.body;

    const normalized = normalize(name.trim());

    const exists = await prisma.subsidiary.findFirst({
      where: {
        id: { not: id },
        name: { equals: normalized, mode: "insensitive" },
      },
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: `Subsidiary "${name}" already exists.` });
    }

    const updated = await prisma.subsidiary.update({
      where: { id },
      data: {
        name: normalized,
        subsidiary_type,
        allowNegativeStock,
        ci,
        nit,
        description,
        address,
        city,
        country,
        cellphone,
        telephone,
        email,
      },
    });

    res.json(updated);
  }
);

// ✅ Cambiar estado (activar/desactivar) con efectos en cascada
export const toggleSubsidiaryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subsidiary = await prisma.subsidiary.findUnique({ where: { id } });

    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found" });
    }

    const newStatus = !subsidiary.status;

    // ✅ Actualizar estado de la sucursal
    const updatedSubsidiary = await prisma.subsidiary.update({
      where: { id },
      data: { status: newStatus },
    });

    // ✅ Actualizar estado de usuarios y roles relacionados
    await Promise.all([
      prisma.user.updateMany({
        where: { subsidiaryId: id },
        data: { status: newStatus },
      }),
      prisma.role.updateMany({
        where: { subsidiaryId: id },
        data: { status: newStatus },
      }),
    ]);

    // ✅ Enviar respuesta con detalles explícitos para Postman
    res.json({
      message: `Subsidiary status updated to ${
        newStatus ? "active" : "inactive"
      }`,
      updated: {
        subsidiaryStatus: newStatus,
        affectedEntities: {
          users: `All users under subsidiary set to ${newStatus}`,
          roles: `All roles under subsidiary set to ${newStatus}`,
        },
      },
      subsidiary: updatedSubsidiary,
    });
  }
);

// ✅ Eliminar Subsidiary (con eliminación en cascada activada por onDelete en Prisma)
export const deleteSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subsidiary = await prisma.subsidiary.findUnique({ where: { id } });
    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found" });
    }

    // 🔍 Contar relaciones antes de eliminar
    const [users, roles] = await Promise.all([
      prisma.user.count({ where: { subsidiaryId: id } }),
      prisma.role.count({ where: { subsidiaryId: id } }),
    ]);

    await prisma.subsidiary.delete({ where: { id } });

    res.json({
      message: `Subsidiary "${subsidiary.name}" and related users/roles deleted successfully.`,
      deletedRelations: { users, roles },
    });
  }
);

export const getSubsidiaryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id },
      include: {
        schedulesSubsidiaries: true,
      },
    });

    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found" });
    }

    const [users, roles] = await Promise.all([
      prisma.user.findMany({
        where: { subsidiaryId: id },
        include: {
          schedulesUsers: true,
          role: true,
        },
      }),
      prisma.role.findMany({
        where: { subsidiaryId: id },
        include: {
          rolePermissions: {
            include: {
              action: true,
              section: true,
            },
          },
        },
      }),
    ]);

    res.json({
      subsidiary,
      users,
      roles,
    });
  }
);

export const getAllSubsidiariesByTenantId = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      status = "all",
      orderBy = "name",
      sort = "asc",
      type, // MATRIZ | SUCURSAL | ALMACEN | OFICINA
    } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    const take = Math.min(parseInt(limit as string), 1000);
    const skip = (parseInt(page as string) - 1) * take;

    const filters: any = {
      tenantId,
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

    if (
      type &&
      ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"].includes(type as string)
    ) {
      filters.subsidiary_type = type;
    }

    const [data, total] = await Promise.all([
      prisma.subsidiary.findMany({
        where: filters,
        orderBy: { [orderBy as string]: sort },
        skip,
        take,
      }),
      prisma.subsidiary.count({ where: filters }),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: take,
      data,
    });
  }
);
