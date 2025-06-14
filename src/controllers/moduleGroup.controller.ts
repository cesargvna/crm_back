// src/controllers/moduleGroup.controller.ts

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import normalize from 'normalize-text';
import { asyncHandler } from '../utils/asyncHandler';

// ✅ Create Module Group
export const createModuleGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, route, iconName, sectionId } = req.body;

  const normalized = normalize(name.trim());

  const exists = await prisma.moduleGroup.findFirst({
    where: {
      name: { equals: normalized, mode: 'insensitive' },
      sectionId,
    },
  });

  if (exists) {
    return res.status(409).json({ message: `Module "${name}" already exists in the section.` });
  }

  const created = await prisma.moduleGroup.create({
    data: {
      name: normalized,
      route,
      iconName,
      sectionId,
    },
  });

  res.status(201).json(created);
});

// ✅ Update
export const updateModuleGroup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, route, iconName, sectionId } = req.body;

  const normalized = normalize(name.trim());

  const existing = await prisma.moduleGroup.findFirst({
    where: {
      id: { not: id },
      name: { equals: normalized, mode: 'insensitive' },
      sectionId,
    },
  });

  if (existing) {
    return res.status(409).json({ message: `Module "${name}" already exists in the section.` });
  }

  const updated = await prisma.moduleGroup.update({
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

// ✅ Toggle status
export const toggleModuleGroupStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const module = await prisma.moduleGroup.findUnique({ where: { id } });
  if (!module) return res.status(404).json({ message: 'Module group not found' });

  const updated = await prisma.moduleGroup.update({
    where: { id },
    data: { status: !module.status },
  });

  res.json(updated);
});

// ✅ Get All Modules (with filters)
export const getAllModuleGroups = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '5',
    search = '',
    status,
    orderBy = 'name',
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
    prisma.moduleGroup.findMany({
      where: filters,
      skip,
      take,
      orderBy: { [orderBy as string]: sort },
    }),
    prisma.moduleGroup.count({ where: filters }),
  ]);

  res.json({ total, page: Number(page), limit: take, data });
});

// ✅ Get by ID
export const getModuleGroupById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const module = await prisma.moduleGroup.findUnique({
    where: { id },
    include: {
      submodules: true,
      section: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!module) return res.status(404).json({ message: 'Module group not found' });

  res.json(module);
});

// ✅ Get All Module Groups with Submodules
export const getAllModuleGroupsComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const modules = await prisma.moduleGroup.findMany({
      include: {
        submodules: true,
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(modules);
  }
);