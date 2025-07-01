import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// 🔑 Normalizador robusto
export function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/ñ/g, "n")
    .replace(/[^a-zA-Z]/g, "")       // solo letras
    .trim();
}

// ✅ Crear Submodule
export const createSubmodule = asyncHandler(async (req: Request, res: Response) => {
  const { name, route, moduleId } = req.body;

  const normalized = normalizeName(name);

  const exists = await prisma.submodule.findFirst({
    where: {
      name: { equals: normalized, mode: "insensitive" },
      moduleId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: `Submodule "${normalized}" already exists in the module.`,
    });
  }

  const created = await prisma.submodule.create({
    data: {
      name: normalized,
      route,
      moduleId,
    },
  });

  res.status(201).json(created);
});

export const updateSubmodule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, route, moduleId } = req.body;

  const normalized = normalizeName(name);

  const exists = await prisma.submodule.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: "insensitive" },
      moduleId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: `Submodule "${normalized}" already exists in the module.`,
    });
  }

  const updated = await prisma.submodule.update({
    where: { id },
    data: {
      name: normalized,
      route,
      moduleId,
    },
  });

  res.json(updated);
});

// ✅ Obtener Submodule por ID
export const getSubmoduleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const submodule = await prisma.submodule.findUnique({
    where: { id },
    include: {
      module: true,
    },
  });

  if (!submodule) {
    return res.status(404).json({ message: "Submodule not found." });
  }

  res.json(submodule);
});
