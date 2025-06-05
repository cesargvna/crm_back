import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";
import normalize from "normalize-text";

// Middleware de autorización local
const ensureSystemAdmin = (req: Request, res: Response): boolean => {
  const roleId = req.user?.roleId?.toLowerCase();
  if (roleId !== "system_admin" && roleId !== "system.admin") {
    res.status(403).json({ message: "Only System.admin can manage tenants." });
    return false;
  }
  return true;
};

export const createTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!ensureSystemAdmin(req, res)) return;

    const normalizedName = normalize(req.body.name.trim().toLowerCase());

    // Validación de duplicados ignorando tildes y mayúsculas
    const existing = await prisma.tenant.findMany();
    const exists = existing.some((tenant) =>
      normalize(tenant.name.trim().toLowerCase()) === normalizedName
    );

    if (exists) {
      res.status(400).json({
        success: false,
        message: `The name "${req.body.name}" is already in use.`,
      });
      return;
    }

    const tenant = await prisma.tenant.create({
      data: {
        id: uuidv4(),
        ...req.body,
      },
    });

    res.status(201).json({ success: true, message: "Tenant created", data: tenant });
  } catch (error) {
    next(error);
  }
};

export const getAllTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!ensureSystemAdmin(req, res)) return;

    const {
      search = '',
      page = '1',
      limit = '10',
      sortBy = 'name',
      sortOrder = 'asc',
      status = 'all'
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {
      ...(status !== 'all' && { status: status === 'true' }),
      ...(search && {
        name: {
          contains: search as string,
          mode: 'insensitive'
        }
      })
    };

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' }
      }),
      prisma.tenant.count({ where })
    ]);

    res.json({
      success: true,
      data: tenants,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!ensureSystemAdmin(req, res)) return;

    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { subsidiaries: true }
    });

    if (!tenant) {
      res.status(404).json({ success: false, message: "Tenant not found" });
      return;
    }

    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!ensureSystemAdmin(req, res)) return;

    const { id } = req.params;
    const { name, ...rest } = req.body;

    if (name) {
      const normalizedNewName = normalize(name.trim().toLowerCase());

      const existing = await prisma.tenant.findMany({
        where: {
          NOT: { id }, // Excluye el tenant actual
        },
      });

      const nameExists = existing.some((tenant) =>
        normalize(tenant.name.trim().toLowerCase()) === normalizedNewName
      );

      if (nameExists) {
        res.status(400).json({
          success: false,
          message: `The name "${name}" is already in use.`,
        });
        return;
      }
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...rest,
      },
    });

    res.status(200).json({ success: true, message: "Tenant updated", data: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleTenantStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!ensureSystemAdmin(req, res)) return;

    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      res.status(404).json({ success: false, message: "Tenant not found" });
      return;
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status: !tenant.status }
    });

    res.status(200).json({ success: true, message: "Tenant status updated", data: updated });
  } catch (error) {
    next(error);
  }
};

export const getMyTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(403).json({ success: false, message: "You do not belong to any tenant." });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subsidiaries: true },
    });

    if (!tenant) {
      res.status(404).json({ success: false, message: "Tenant not found." });
      return;
    }

    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};