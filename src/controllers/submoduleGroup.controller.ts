// src/controllers/submoduleGroup.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import normalize from "normalize-text";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Create Submodule Group
export const createSubmoduleGroup = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, route, moduleId } = req.body;

    const normalized = normalize(name.trim());

    const exists = await prisma.submoduleGroup.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
        moduleId,
      },
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: `Submodule "${name}" already exists in the module.` });
    }

    const created = await prisma.submoduleGroup.create({
      data: {
        name: normalized,
        route,
        moduleId,
      },
    });

    res.status(201).json(created);
  }
);

// ✅ Update Submodule Group
export const updateSubmoduleGroup = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, route, moduleId } = req.body;

    const normalized = normalize(name.trim());

    const existing = await prisma.submoduleGroup.findFirst({
      where: {
        id: { not: id },
        name: { equals: normalized, mode: "insensitive" },
        moduleId,
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: `Submodule "${name}" already exists in the module.` });
    }

    const updated = await prisma.submoduleGroup.update({
      where: { id },
      data: {
        name: normalized,
        route,
        moduleId,
      },
    });

    res.json(updated);
  }
);

// ✅ Toggle status
export const toggleSubmoduleGroupStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const submodule = await prisma.submoduleGroup.findUnique({ where: { id } });
    if (!submodule)
      return res.status(404).json({ message: "Submodule group not found" });

    const updated = await prisma.submoduleGroup.update({
      where: { id },
      data: { status: !submodule.status },
    });

    res.json(updated);
  }
);

// ✅ Get All Submodules (with filters)
export const getAllSubmoduleGroups = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "5",
      search = "",
      status,
      orderBy = "name",
      sort = "asc",
    } = req.query;

    const take = Math.min(parseInt(limit as string), 1000);
    const skip = (parseInt(page as string) - 1) * take;

    const filters: any = {
      name: {
        contains: normalize(search as string),
        mode: "insensitive",
      },
    };

    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    const [data, total] = await Promise.all([
      prisma.submoduleGroup.findMany({
        where: filters,
        skip,
        take,
        orderBy: { [orderBy as string]: sort },
      }),
      prisma.submoduleGroup.count({ where: filters }),
    ]);

    res.json({ total, page: Number(page), limit: take, data });
  }
);

// ✅ Get by ID
export const getSubmoduleGroupById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const submodule = await prisma.submoduleGroup.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            name: true,
            section: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!submodule) {
      return res.status(404).json({ message: "Submodule group not found" });
    }

    res.json(submodule);
  }
);

// ✅ Get All Submodule Groups Complete
export const getAllSubmoduleGroupsComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const submodules = await prisma.submoduleGroup.findMany({
      include: {
        module: {
          include: {
            section: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(submodules);
  }
);
