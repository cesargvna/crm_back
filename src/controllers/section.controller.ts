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

export interface SidebarAction {
  id: string;
  name: string;
  status: boolean;
}

export interface SidebarSubmodule {
  id: string;
  name: string;
  allowedActions: SidebarAction[];
}

export interface SidebarModule {
  id: string;
  name: string;
  allowedActions: SidebarAction[];
  submodules: SidebarSubmodule[];
}

export interface SidebarSection {
  id: string;
  name: string;
  modules: SidebarModule[];
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

export const getSidebarSectionsByRole = asyncHandler(async (req: Request, res: Response) => {
  const { roleId } = req.params;

  if (!roleId) {
    return res.status(400).json({ message: "Missing roleId" });
  }

  // 1️⃣ Verifica el rol
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { name: true },
  });

  if (!role) {
    return res.status(404).json({ message: "Role not found." });
  }

  const isSystemAdmin = role.name.toLowerCase() === "system.admin";

  // 2️⃣ Obtén los permisos del rol filtrando acción 'ver'
  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      roleId,
      action: {
        name: "ver", // Filtras solo la acción 'ver'
      },
    },
    include: {
      module: { include: { section: true } },
      submodule: { include: { module: { include: { section: true } } } },
    },
  });

  // 3️⃣ Construye el árbol de Sections → Modules → Submodules con solo 'ver'
  const sidebar: Record<string, any> = {};

  for (const rp of rolePermissions) {
    const section = rp.module?.section || rp.submodule?.module?.section;
    const module = rp.module || rp.submodule?.module;
    const submodule = rp.submodule;

    if (!section || !module) continue; // Safety

    if (!sidebar[section.id]) {
      sidebar[section.id] = {
        id: section.id,
        name: section.name,
        modules: {},
      };
    }

    if (!sidebar[section.id].modules[module.id]) {
      sidebar[section.id].modules[module.id] = {
        id: module.id,
        name: module.name,
        submodules: {},
      };
    }

    if (submodule) {
      if (!sidebar[section.id].modules[module.id].submodules[submodule.id]) {
        sidebar[section.id].modules[module.id].submodules[submodule.id] = {
          id: submodule.id,
          name: submodule.name,
        };
      }
    }
  }

  // 4️⃣ Conviertes el árbol a array para tu frontend
  const sidebarArray = Object.values(sidebar).map((section: any) => ({
    id: section.id,
    name: section.name,
    modules: Object.values(section.modules).map((module: any) => ({
      id: module.id,
      name: module.name,
      submodules: Object.values(module.submodules),
    })),
  }));

  res.json(sidebarArray);
});

// ✅ GET: /sidebar-visibility
export const getSidebarVisibilityTree = asyncHandler(async (_req: Request, res: Response) => {
  const sections = await prisma.section.findMany({
    where: { visibility: true },
    select: {
      id: true,
      name: true,
      // ❌ No hay iconName en Section, así que no lo pedimos
      modules: {
        select: {
          id: true,
          name: true,
          iconName: true, // ✅ Solo aquí, porque Module sí lo tiene
          submodules: {
            select: {
              id: true,
              name: true,
              // ❌ No hay iconName en Submodule, así que no lo pedimos
            },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const sidebar: SidebarSection[] = await Promise.all(
    sections.map(async (section) => {
      const modules: SidebarModule[] = await Promise.all(
        section.modules.map(async (module) => {
          let allowedActions: SidebarAction[] = [];
          let submodules: SidebarSubmodule[] = [];

          if (module.submodules.length > 0) {
            // ✅ Módulo con submodules → buscar allowedActions por submodule
            submodules = await Promise.all(
              module.submodules.map(async (sub) => {
                const actions = await prisma.allowedAction.findMany({
                  where: { submoduleId: sub.id },
                  include: { action: true },
                });
                return {
                  id: sub.id,
                  name: sub.name,
                  allowedActions: actions.map((a) => ({
                    id: a.action.id,
                    name: a.action.name,
                    status: a.action.status,
                  })),
                };
              })
            );
          } else {
            // ✅ Módulo sin submodules → buscar allowedActions por módulo
            const actions = await prisma.allowedAction.findMany({
              where: { moduleId: module.id },
              include: { action: true },
            });
            allowedActions = actions.map((a) => ({
              id: a.action.id,
              name: a.action.name,
              status: a.action.status,
            }));
          }

          return {
            id: module.id,
            name: module.name,
            iconName: module.iconName, // ✅ Incluido en respuesta
            allowedActions,
            submodules,
          };
        })
      );

      return {
        id: section.id,
        name: section.name,
        modules,
      };
    })
  );

  res.status(200).json(sidebar);
});

export const getSidebarHiddenTree = asyncHandler(async (_req: Request, res: Response) => {
  const sections = await prisma.section.findMany({
    where: { visibility: false },
    include: {
      modules: { include: { submodules: true } },
    },
    orderBy: { order: "asc" },
  });

  const sidebar: SidebarSection[] = await Promise.all(
    sections.map(async (section) => {
      const modules: SidebarModule[] = await Promise.all(
        section.modules.map(async (module) => {
          let allowedActions: SidebarAction[] = [];
          let submodules: SidebarSubmodule[] = [];

          if (module.submodules.length > 0) {
            submodules = await Promise.all(
              module.submodules.map(async (sub) => {
                const actions = await prisma.allowedAction.findMany({
                  where: { submoduleId: sub.id },
                  include: { action: true },
                });
                return {
                  id: sub.id,
                  name: sub.name,
                  allowedActions: actions.map((a) => ({
                    id: a.action.id,
                    name: a.action.name,
                    status: a.action.status,
                  })),
                };
              })
            );
          } else {
            const actions = await prisma.allowedAction.findMany({
              where: { moduleId: module.id },
              include: { action: true },
            });
            allowedActions = actions.map((a) => ({
              id: a.action.id,
              name: a.action.name,
              status: a.action.status,
            }));
          }

          return {
            id: module.id,
            name: module.name,
            allowedActions,
            submodules,
          };
        })
      );

      return {
        id: section.id,
        name: section.name,
        modules,
      };
    })
  );

  res.status(200).json(sidebar);
});
