import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import normalize from 'normalize-text';
import { asyncHandler } from '../utils/asyncHandler';

// ✅ Crear PermissionAction
export const createPermissionAction = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const normalized = normalize(name.trim());

  const exists = await prisma.permissionAction.findFirst({
    where: {
      name: { equals: normalized, mode: 'insensitive' },
    },
  });

  if (exists) {
    return res.status(409).json({ message: `Action "${name}" already exists.` });
  }

  const created = await prisma.permissionAction.create({
    data: {
      name: normalized,
    },
  });

  res.status(201).json(created);
});

// ✅ Actualizar PermissionAction
export const updatePermissionAction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const normalized = normalize(name.trim());

  const exists = await prisma.permissionAction.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: 'insensitive' },
    },
  });

  if (exists) {
    return res.status(409).json({ message: `Action "${name}" already exists.` });
  }

  const updated = await prisma.permissionAction.update({
    where: { id },
    data: { name: normalized },
  });

  res.json(updated);
});

// ✅ Obtener todas sin paginación ni filtros
export const getAllPermissionActions = asyncHandler(async (req: Request, res: Response) => {
  const actions = await prisma.permissionAction.findMany({
    orderBy: { name: 'asc' },
  });

  res.json(actions);
});

// ✅ Obtener por ID
export const getPermissionActionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const action = await prisma.permissionAction.findUnique({
    where: { id },
  });

  if (!action) {
    return res.status(404).json({ message: 'Permission action not found' });
  }

  res.json(action);
});
