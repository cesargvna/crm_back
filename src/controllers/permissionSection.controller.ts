import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import normalize from "normalize-text";
import { asyncHandler } from '../utils/asyncHandler';

// ✅ Crear PermissionSection
export const createPermissionSection = asyncHandler(async (req: Request, res: Response) => {
  const { name, order } = req.body;

  const normalized = normalize(name.trim());

  const exists = await prisma.permissionSection.findFirst({
    where: {
      name: { equals: normalized, mode: 'insensitive' },
    },
  });

  if (exists) {
    return res.status(409).json({ message: `Section "${name}" already exists.` });
  }

  const created = await prisma.permissionSection.create({
    data: {
      name: normalized,
      order,
    },
  });

  res.status(201).json(created);
});

// ✅ Obtener todas con búsqueda, orden, paginación y filtro por estado
export const getAllPermissionSections = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '5',
    search = '',
    status,
    orderBy = 'order',
    sort = 'asc',
  } = req.query;

  const take = Math.min(parseInt(limit as string), 1000);
  const skip = (parseInt(page as string) - 1) * take;

  const filters: any = {
    name: {
      contains: normalize(search as string),
      mode: 'insensitive',
    },
  };

  if (status === 'true' || status === 'false') {
    filters.status = status === 'true';
  }

  const [data, total] = await Promise.all([
    prisma.permissionSection.findMany({
      where: filters,
      orderBy: { [orderBy as string]: sort },
      skip,
      take,
    }),
    prisma.permissionSection.count({ where: filters }),
  ]);

  res.json({
    total,
    page: Number(page),
    limit: take,
    data,
  });
});

// ✅ Obtener por ID
export const getPermissionSectionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const section = await prisma.permissionSection.findUnique({
    where: { id },
  });

  if (!section) {
    return res.status(404).json({ message: 'Permission section not found' });
  }

  res.json(section);
});

// ✅ Actualizar
export const updatePermissionSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, order } = req.body;

  const normalized = normalize(name.trim());

  const existing = await prisma.permissionSection.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: 'insensitive' },
    },
  });

  if (existing) {
    return res.status(409).json({ message: `Section "${name}" already exists.` });
  }

  const updated = await prisma.permissionSection.update({
    where: { id },
    data: {
      name: normalized,
      order,
    },
  });

  res.json(updated);
});

// ✅ Cambiar estado automáticamente (toggle)
export const togglePermissionSectionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const section = await prisma.permissionSection.findUnique({ where: { id } });

  if (!section) {
    return res.status(404).json({ message: 'Permission section not found' });
  }

  const updated = await prisma.permissionSection.update({
    where: { id },
    data: { status: !section.status }, // 👈 Inversión automática
  });

  res.json(updated);
});