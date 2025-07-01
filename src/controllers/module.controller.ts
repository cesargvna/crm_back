import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// 🔑 Normalizador robusto (reutilizable)
export function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/ñ/g, "n")
    .replace(/[^a-zA-Z]/g, "")       // solo letras, quita TODO lo demás
    .trim();
}

// ✅ Crear Module
export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const { name, route, iconName, sectionId } = req.body;

  const normalized = normalizeName(name);

  const exists = await prisma.module.findFirst({
    where: {
      name: { equals: normalized, mode: "insensitive" },
      sectionId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: `Module "${normalized}" already exists in the section.`,
    });
  }

  const created = await prisma.module.create({
    data: {
      name: normalized,
      route,
      iconName,
      sectionId,
    },
  });

  res.status(201).json(created);
});

// ✅ Actualizar Module
export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, route, iconName, sectionId } = req.body;

  const normalized = normalizeName(name);

  const exists = await prisma.module.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: "insensitive" },
      sectionId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: `Module "${normalized}" already exists in the section.`,
    });
  }

  const updated = await prisma.module.update({
    where: { id },
    data: {
      name: normalized,
      route,
      iconName,
      sectionId,
    },
  });

  res.json(updated);
});

// ✅ Obtener Module por ID
export const getModuleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const module = await prisma.module.findUnique({
    where: { id },
    include: {
      section: true,
      submodules: true,
    },
  });

  if (!module) {
    return res.status(404).json({ message: "Module not found." });
  }

  res.json(module);
});
