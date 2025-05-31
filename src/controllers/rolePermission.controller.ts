// src/controllers/rolePermission.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';

// ✅ Create Permission Group
export const createPermissionGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type } = req.body;
    const group = await prisma.permissionGroup.create({
      data: { id: uuidv4(), name, type }
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Permission Group
export const updatePermissionGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, type } = req.body;
    const group = await prisma.permissionGroup.update({
      where: { id },
      data: { name, type }
    });
    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Groups
export const getAllGroups = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await prisma.permissionGroup.findMany();
    res.json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

// ✅ Create Permission Action
export const createPermissionAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const action = await prisma.permissionAction.create({
      data: { id: uuidv4(), name }
    });
    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Permission Action
export const updatePermissionAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name } = req.body;
    const action = await prisma.permissionAction.update({
      where: { id },
      data: { name }
    });
    res.json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Actions
export const getAllActions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const actions = await prisma.permissionAction.findMany();
    res.json({ success: true, data: actions });
  } catch (error) {
    next(error);
  }
};

// ✅ Create Role
export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const role = await prisma.role.create({
      data: { id: uuidv4(), name, description }
    });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Role
export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, description } = req.body;
    const updatedRole = await prisma.role.update({
      where: { id },
      data: { name, description }
    });
    res.json({ success: true, message: 'Role updated successfully', data: updatedRole });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Role by ID (with permissions)
export const getRoleWithPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { group: true, action: true }
        }
      }
    });

    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }

    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Roles (simple list)
export const getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search = '',
      page = '1',
      limit = '10',
      sortBy = 'name',
      sortOrder = 'asc',
      status = 'all',
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string).trim();

    const where: any = {
      ...(status !== 'all' && { status: status === 'true' }),
      ...(searchTerm.length >= 3 && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
    };

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: {
          [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc',
        },
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


// ✅ Toggle Role Status (remove if status not used)
export const toggleRoleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({ where: { id } });

    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found' });
      return;
    }

    const updated = await prisma.role.update({
      where: { id },
      data: { status: !role.status },
    });

    res.json({ success: true, message: 'Role status updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// ✅ Assign Permissions to Role
export const assignPermissionsToRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleId, permissions } = req.body;
    const data = permissions.map((p: any) => ({
      id: uuidv4(),
      roleId,
      groupId: p.groupId,
      actionId: p.actionId
    }));
    await prisma.rolePermission.createMany({ data, skipDuplicates: true });
    res.status(201).json({ success: true, message: 'Permissions assigned successfully' });
  } catch (error) {
    next(error);
  }
};
