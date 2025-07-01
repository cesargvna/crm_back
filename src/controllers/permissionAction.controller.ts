import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// 🔑 Normalizador robusto: solo letras
export function normalizeActionName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-zA-Z]/g, "")
    .trim();
}

// ✅ Crear
export const createPermissionAction = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const normalized = normalizeActionName(name);

  const exists = await prisma.permissionAction.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
  });

  if (exists) {
    return res.status(409).json({ message: `Action "${normalized}" already exists.` });
  }

  const created = await prisma.permissionAction.create({
    data: { name: normalized },
  });

  res.status(201).json(created);
});

// ✅ Actualizar
export const updatePermissionAction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const normalized = normalizeActionName(name);

  const exists = await prisma.permissionAction.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: "insensitive" },
    },
  });

  if (exists) {
    return res.status(409).json({ message: `Action "${normalized}" already exists.` });
  }

  const updated = await prisma.permissionAction.update({
    where: { id },
    data: { name: normalized },
  });

  res.json(updated);
});

// ✅ Toggle status
export const togglePermissionActionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const action = await prisma.permissionAction.findUnique({ where: { id } });
  if (!action) {
    return res.status(404).json({ message: "Permission action not found." });
  }

  const updated = await prisma.permissionAction.update({
    where: { id },
    data: { status: !action.status },
  });

  res.json(updated);
});

// ✅ Get all
export const getAllPermissionActions = asyncHandler(async (_req: Request, res: Response) => {
  const actions = await prisma.permissionAction.findMany({
    orderBy: { name: "asc" },
  });
  res.json(actions);
});

// ✅ Get by ID
export const getPermissionActionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const action = await prisma.permissionAction.findUnique({ where: { id } });
  if (!action) {
    return res.status(404).json({ message: "Permission action not found." });
  }

  res.json(action);
});
