// src/controllers/rolePermission.controller.ts
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";

// ✅ Create Permission Section
export const createPermissionSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, order = 0 } = req.body;

    const existingOrder = await prisma.permissionSection.findFirst({
      where: { order }
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: `Another section already uses order "${order}". Orders must be unique.`,
      });
    }

    const section = await prisma.permissionSection.create({
      data: {
        id: uuidv4(),
        name,
        order,
      },
    });

    res.status(201).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};
// ✅ Update Permission Section
export const updatePermissionSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, name, order } = req.body;

    const conflicting = await prisma.permissionSection.findFirst({
      where: {
        order,
        NOT: { id }, // ⚠️ asegura que no sea el mismo registro
      },
    });

    if (conflicting) {
      return res.status(400).json({
        success: false,
        message: `Another section already uses order "${order}". Please choose a different value.`,
      });
    }

    const section = await prisma.permissionSection.update({
      where: { id },
      data: { name, order },
    });

    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

// ✅ Toggle Permission Section status
export const togglePermissionSectionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const section = await prisma.permissionSection.findUnique({
      where: { id },
    });

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    const updated = await prisma.permissionSection.update({
      where: { id },
      data: { status: !section.status },
    });

    res.json({
      success: true,
      message: "Section status updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Permission Section (con filtros, paginado y búsqueda)
export const getAllPermissionSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "order",
      sortOrder = "asc",
      status = "all",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string).trim();

    const where: any = {
      ...(status !== "all" && { status: status === "true" }),
      ...(searchTerm.length >= 3 && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
    };

    const [sections, total] = await Promise.all([
      prisma.permissionSection.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder === "desc" ? "desc" : "asc",
        },
        skip,
        take: pageSize,
        include: {
          modules: {
            include: { submodules: true },
          },
        },
      }),
      prisma.permissionSection.count({ where }),
    ]);

    res.json({
      success: true,
      data: sections,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get one Permission Section by ID (con relaciones completas)
export const getPermissionSectionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const section = await prisma.permissionSection.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            submodules: true,
          },
        },
        rolePermissions: {
          include: {
            role: true,
            action: true,
          },
        },
      },
    });

    if (!section) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

// ✅ Create ModuleGroup
export const createModuleGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, route, iconName, sectionId } = req.body;

    const module = await prisma.moduleGroup.create({
      data: {
        id: uuidv4(),
        name,
        route,
        iconName,
        sectionId,
      },
    });

    res.status(201).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

// ✅ Update ModuleGroup
export const updateModuleGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, name, route, iconName, sectionId } = req.body;

    const updated = await prisma.moduleGroup.update({
      where: { id },
      data: { name, route, iconName, sectionId },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ Toggle ModuleGroup status
export const toggleModuleGroupStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const module = await prisma.moduleGroup.findUnique({ where: { id } });

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    const updated = await prisma.moduleGroup.update({
      where: { id },
      data: { status: !module.status },
    });

    res.json({
      success: true,
      message: "Module status updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All ModuleGroups con filtros, búsqueda y paginación
export const getAllModuleGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "name",
      sortOrder = "asc",
      status = "all",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string).trim();

    const where: any = {
      ...(status !== "all" && { status: status === "true" }),
      ...(searchTerm.length >= 3 && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
    };

    const [modules, total] = await Promise.all([
      prisma.moduleGroup.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder === "desc" ? "desc" : "asc",
        },
        skip,
        take: pageSize,
        include: {
          section: true,
          submodules: true,
        },
      }),
      prisma.moduleGroup.count({ where }),
    ]);

    res.json({
      success: true,
      data: modules,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get one ModuleGroup by ID (con sección y submódulos)
export const getModuleGroupById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const module = await prisma.moduleGroup.findUnique({
      where: { id },
      include: {
        section: true,
        submodules: true,
      },
    });

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    res.json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

// ✅ Create SubmoduleGroup
export const createSubmoduleGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, route, moduleId } = req.body;

    const submodule = await prisma.submoduleGroup.create({
      data: {
        id: uuidv4(),
        name,
        route,
        moduleId,
      },
    });

    res.status(201).json({ success: true, data: submodule });
  } catch (error) {
    next(error);
  }
};

// ✅ Update SubmoduleGroup
export const updateSubmoduleGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, name, route, moduleId } = req.body;

    const updated = await prisma.submoduleGroup.update({
      where: { id },
      data: { name, route, moduleId },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ Toggle SubmoduleGroup status
export const toggleSubmoduleGroupStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const submodule = await prisma.submoduleGroup.findUnique({ where: { id } });

    if (!submodule) {
      return res
        .status(404)
        .json({ success: false, message: "Submodule not found" });
    }

    const updated = await prisma.submoduleGroup.update({
      where: { id },
      data: { status: !submodule.status },
    });

    res.json({
      success: true,
      message: "Submodule status updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All SubmoduleGroups (filtros, búsqueda, paginado, orden)
export const getAllSubmoduleGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "name",
      sortOrder = "asc",
      status = "all",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string).trim();

    const where: any = {
      ...(status !== "all" && { status: status === "true" }),
      ...(searchTerm.length >= 3 && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
    };

    const [submodules, total] = await Promise.all([
      prisma.submoduleGroup.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder === "desc" ? "desc" : "asc",
        },
        skip,
        take: pageSize,
        include: {
          module: true,
        },
      }),
      prisma.submoduleGroup.count({ where }),
    ]);

    res.json({
      success: true,
      data: submodules,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get one SubmoduleGroup by ID
export const getSubmoduleGroupById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const submodule = await prisma.submoduleGroup.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!submodule) {
      return res
        .status(404)
        .json({ success: false, message: "Submodule not found" });
    }

    res.json({ success: true, data: submodule });
  } catch (error) {
    next(error);
  }
};

// ✅ Create PermissionAction
export const createPermissionAction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const action = await prisma.permissionAction.create({
      data: { id: uuidv4(), name },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

// ✅ Update PermissionAction
export const updatePermissionAction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, name } = req.body;

    const updated = await prisma.permissionAction.update({
      where: { id },
      data: { name },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All PermissionAction (with search and pagination)
export const getAllPermissionActions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;
    const searchTerm = (search as string).trim();

    const where: any =
      searchTerm.length >= 3
        ? { name: { contains: searchTerm, mode: "insensitive" } }
        : {};

    const [actions, total] = await Promise.all([
      prisma.permissionAction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy as string]: sortOrder === "desc" ? "desc" : "asc" },
      }),
      prisma.permissionAction.count({ where }),
    ]);

    res.json({
      success: true,
      data: actions,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Create Role
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;

    const role = await prisma.role.create({
      data: { id: uuidv4(), name, description },
    });

    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Role
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, name, description } = req.body;

    const updated = await prisma.role.update({
      where: { id },
      data: { name, description },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ Toggle Role status
export const toggleRoleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });

    const updated = await prisma.role.update({
      where: { id },
      data: { status: !role.status },
    });

    res.json({ success: true, message: "Role status updated", data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Role by ID (include permissions, actions, section)
export const getRoleWithPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            action: true,
            section: {
              include: {
                modules: {
                  include: {
                    submodules: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Roles (search, pagination, status)
export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "name",
      sortOrder = "asc",
      status = "all",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string).trim();
    const where: any = {
      ...(status !== "all" && { status: status === "true" }),
      ...(searchTerm.length >= 3 && {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    };

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder === "desc" ? "desc" : "asc" },
        skip,
        take: pageSize,
      }),
      prisma.role.count({ where }),
    ]);

    res.json({
      success: true,
      data: roles,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Assign Permissions to Role
export const assignPermissionsToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleId, permissions } = req.body;

    // Borrado previo si lo deseas:
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    const data = permissions.map((p: any) => ({
      id: uuidv4(),
      roleId,
      sectionId: p.sectionId,
      actionId: p.actionId,
    }));

    await prisma.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });

    res
      .status(201)
      .json({ success: true, message: "Permissions assigned successfully" });
  } catch (error) {
    next(error);
  }
};
