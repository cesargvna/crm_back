import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";

export const createTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenant = await prisma.tenant.create({
      data: { id: uuidv4(), ...req.body }
    });
    res.status(201).json({ success: true, message: "Tenant created", data: tenant });
  } catch (error) {
    next(error);
  }
};

export const getAllTenants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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
    const { id } = req.params;
    const updated = await prisma.tenant.update({ where: { id }, data: req.body });
    res.status(200).json({ success: true, message: "Tenant updated", data: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleTenantStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      res.status(404).json({ success: false, message: "Tenant not found" });
      return;
    }
    const updated = await prisma.tenant.update({ where: { id }, data: { status: !tenant.status } });
    res.status(200).json({ success: true, message: "Tenant status updated", data: updated });
  } catch (error) {
    next(error);
  }
};