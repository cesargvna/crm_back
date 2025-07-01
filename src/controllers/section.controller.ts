import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// 🔑 Normalizador robusto
export function normalizeSectionName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/ñ/g, "n")              // reemplaza ñ por n
    .replace(/[^a-zA-Z]/g, "")       // solo letras, quita TODO lo demás
    .trim();
}

// ✅ Crear Section
export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const { name, order } = req.body;

  const normalized = normalizeSectionName(name);

  const exists = await prisma.section.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
  });

  if (exists) {
    return res.status(409).json({ message: `Section "${normalized}" already exists.` });
  }

  const created = await prisma.section.create({
    data: {
      name: normalized,
      order: order || 0,
    },
  });

  res.status(201).json(created);
});

// ✅ Actualizar Section
export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, order } = req.body;

  const normalized = normalizeSectionName(name);

  const exists = await prisma.section.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: "insensitive" },
    },
  });

  if (exists) {
    return res.status(409).json({ message: `Section "${normalized}" already exists.` });
  }

  const updated = await prisma.section.update({
    where: { id },
    data: {
      name: normalized,
      order: order || 0,
    },
  });

  res.json(updated);
});

// ✅ Cambiar visibilidad
export const toggleSectionVisibility = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1️⃣ Buscar la sección actual
  const section = await prisma.section.findUnique({
    where: { id },
    select: { visibility: true },
  });

  if (!section) {
    return res.status(404).json({ message: "Section not found." });
  }

  // 2️⃣ Invertir visibilidad
  const newVisibility = !section.visibility;

  // 3️⃣ Actualizar
  const updated = await prisma.section.update({
    where: { id },
    data: { visibility: newVisibility },
  });

  res.json(updated);
});

// ✅ Get secciones visibles
export const getVisibleSections = asyncHandler(async (_req: Request, res: Response) => {
  const sections = await prisma.section.findMany({
    where: { visibility: true },
    include: { modules: { include: { submodules: true } } },
    orderBy: { order: "asc" },
  });
  res.json(sections);
});

// ✅ Get secciones ocultas (para system.admin)
export const getHiddenSections = asyncHandler(async (_req: Request, res: Response) => {
  const sections = await prisma.section.findMany({
    where: { visibility: false },
    include: { modules: { include: { submodules: true } } },
    orderBy: { order: "asc" },
  });
  res.json(sections);
});

// ✅ Get Sidebar filtrado por rol (opcional)
export const getSidebarSectionsByRole = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params; // 👈 ahora se lee de params, no de query

  if (!roleId) {
    return res.status(400).json({ message: "Missing roleId" });
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { name: true },
  });

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  const isSystemAdmin = role.name.toLowerCase() === "system.admin";

  const sections = await prisma.section.findMany({
    where: isSystemAdmin
      ? {}
      : { name: { not: "Administracion", mode: "insensitive" }, visibility: true },
    include: {
      modules: {
        include: { submodules: true },
      },
    },
    orderBy: { order: "asc" },
  });

  res.json(sections);
});