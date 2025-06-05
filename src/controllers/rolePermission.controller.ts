// src/controllers/rolePermission.controller.ts
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";
import normalize from "normalize-text";

// ✅ Create Permission Section
export const createPermissionSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, order = 0 } = req.body;

    // Normalizamos nombre
    const normalizedName = normalize(name.trim().toLowerCase());

    // Verifica nombre duplicado (ignorando tildes y mayúsculas)
    const existingName = await prisma.permissionSection.findMany();
    const nameExists = existingName.some(
      (section) =>
        normalize(section.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `The name "${name}" is already in use.`,
      });
    }

    // Verifica orden duplicado
    const orderExists = await prisma.permissionSection.findFirst({
      where: { order },
    });
    if (orderExists) {
      return res.status(400).json({
        success: false,
        message: `Another section already uses order "${order}".`,
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

    const current = await prisma.permissionSection.findUnique({
      where: { id },
    });
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found." });
    }

    const normalizedName = normalize(name.trim().toLowerCase());

    // Validar nombre duplicado (excepto él mismo)
    const otherSections = await prisma.permissionSection.findMany({
      where: { NOT: { id } },
    });

    const nameExists = otherSections.some(
      (section) =>
        normalize(section.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `Another section already uses the name "${name}".`,
      });
    }

    // Validar orden duplicado (excepto él mismo)
    const orderExists = await prisma.permissionSection.findFirst({
      where: {
        order,
        NOT: { id },
      },
    });

    if (orderExists) {
      return res.status(400).json({
        success: false,
        message: `Another section already uses order "${order}".`,
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

    const normalizedName = normalize(name.trim().toLowerCase());

    const existingModules = await prisma.moduleGroup.findMany({
      where: { sectionId },
    });

    const nameExists = existingModules.some(
      (m) => normalize(m.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `The name "${name}" is already used in this section.`,
      });
    }

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

    const current = await prisma.moduleGroup.findUnique({ where: { id } });
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    const normalizedName = normalize(name.trim().toLowerCase());

    const otherModules = await prisma.moduleGroup.findMany({
      where: {
        sectionId,
        NOT: { id },
      },
    });

    const nameExists = otherModules.some(
      (m) => normalize(m.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `Another module in this section already uses the name "${name}".`,
      });
    }

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

    const normalizedName = normalize(name.trim().toLowerCase());

    const existing = await prisma.submoduleGroup.findMany({
      where: { moduleId },
    });

    const nameExists = existing.some(
      (s) => normalize(s.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `The name "${name}" is already used in this module.`,
      });
    }

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

    const current = await prisma.submoduleGroup.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Submodule not found",
      });
    }

    const normalizedName = normalize(name.trim().toLowerCase());

    const others = await prisma.submoduleGroup.findMany({
      where: {
        moduleId,
        NOT: { id },
      },
    });

    const nameExists = others.some(
      (s) => normalize(s.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `Another submodule in this module already uses the name "${name}".`,
      });
    }

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
    const normalizedName = normalize(name.trim().toLowerCase());

    const allActions = await prisma.permissionAction.findMany();
    const nameExists = allActions.some(
      (a) => normalize(a.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `The name "${name}" already exists in permission actions.`,
      });
    }

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

    const current = await prisma.permissionAction.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Permission action not found",
      });
    }

    const normalizedName = normalize(name.trim().toLowerCase());

    const others = await prisma.permissionAction.findMany({
      where: {
        NOT: { id },
      },
    });

    const nameExists = others.some(
      (a) => normalize(a.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `Another action already uses the name "${name}".`,
      });
    }

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

// ✅ Crear rol
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const tenantId = req.user?.tenantId;

    const normalizedName = normalize(name.trim().toLowerCase());

    const existingRoles = await prisma.role.findMany({
      where: { tenantId },
    });

    const nameExists = existingRoles.some(
      (role) => normalize(role.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `The name "${name}" is already in use for this tenant.`,
      });
    }

    const newRole = await prisma.role.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        description: description?.trim() || "",
        tenantId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Actualizar rol
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const tenantId = req.user?.tenantId;

    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    const normalizedName = normalize(name.trim().toLowerCase());

    const existingRoles = await prisma.role.findMany({
      where: {
        tenantId,
        NOT: { id },
      },
    });

    const nameExists = existingRoles.some(
      (r) => normalize(r.name.trim().toLowerCase()) === normalizedName
    );

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `The name "${name}" is already in use for this tenant.`,
      });
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || "",
      },
    });

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updated,
    });
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

// ✅ Add Permissions to Role
export const addPermissionsToRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleId, permissions } = req.body;

    const seen = new Set();
    for (const p of permissions) {
      const key = `${p.sectionId}_${p.actionId}`;
      if (seen.has(key)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate permission in request: section "${p.sectionId}", action "${p.actionId}".`,
        });
      }
      seen.add(key);
    }

    const data = permissions.map((p: any) => ({
      id: uuidv4(),
      roleId,
      sectionId: p.sectionId,
      actionId: p.actionId,
    }));

    await prisma.rolePermission.createMany({
      data,
      skipDuplicates: true, // evita errores si ya existen
    });

    res.status(201).json({
      success: true,
      message: "Permissions added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const permission = await prisma.rolePermission.findUnique({
      where: { id },
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found for this role.",
      });
    }

    await prisma.rolePermission.delete({ where: { id } });

    res.json({
      success: true,
      message: "Permission removed from role.",
    });
  } catch (error) {
    next(error);
  }
};

export const removeMultiplePermissionsFromRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rolePermissionIds } = req.body;

    if (!Array.isArray(rolePermissionIds) || rolePermissionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You must provide at least one permission ID to remove.",
      });
    }

    // 1. Obtener todos los permisos con esos IDs
    const permissions = await prisma.rolePermission.findMany({
      where: { id: { in: rolePermissionIds } },
    });

    // 2. Validar existencia
    if (permissions.length !== rolePermissionIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more permission IDs do not exist.",
      });
    }

    // 3. Validar que todos pertenezcan al mismo rol
    const uniqueRoles = new Set(permissions.map((p) => p.roleId));
    if (uniqueRoles.size > 1) {
      return res.status(400).json({
        success: false,
        message:
          "Permissions belong to multiple roles. Only one role is allowed per deletion.",
      });
    }

    // 4. Eliminar
    await prisma.rolePermission.deleteMany({
      where: {
        id: { in: rolePermissionIds },
      },
    });

    res.json({
      success: true,
      message: "Selected permissions removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissionsByRoleId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    const permissions = await prisma.rolePermission.findMany({
      where: { roleId: id },
      include: {
        section: { select: { id: true, name: true } },
        action: { select: { id: true, name: true } },
      },
      orderBy: { created_at: "asc" },
    });

    res.json({
      success: true,
      permissions: permissions.map((p) => ({
        id: p.id,
        section: p.section,
        action: p.action,
      })),
    });
  } catch (error) {
    next(error);
  }
};
