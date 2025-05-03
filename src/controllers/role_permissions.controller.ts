import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";


// Create Role
export const createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, status, permissions } = req.body;

        const newRole = await prisma.role.create({
            data: {
                id: uuidv4(),
                name,
                status,
                permissions: {
                    create: permissions.map((permissionId: string) => ({ permissionId }))
                }
            }
        });

        res.status(201).json({ success: true, message: "Role created", data: newRole });
    } catch (error) {
        next(error);
    }
};

// Update Role
export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, status, permissions } = req.body;

        const updatedRole = await prisma.role.update({
            where: { id },
            data: {
                name,
                status,
                permissions: {
                    deleteMany: {},
                    create: permissions.map((permissionId: string) => ({ permissionId }))
                }
            }
        });

        res.json({ success: true, message: "Role updated", data: updatedRole });
    } catch (error) {
        next(error);
    }
};

// Delete Role
export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.rolePermission.deleteMany({ where: { roleId: id } });
        await prisma.role.delete({ where: { id } });

        res.json({ success: true, message: "Role deleted" });
    } catch (error) {
        next(error);
    }
};

// Get Role by ID
export const getRoleById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        const { id } = req.params;
        const role = await prisma.role.findUnique({
            where: { id },
            include: { permissions: { include: { permission: true } } }
        });

        if (!role){
            res.status(404).json({ success: false, message: "Role not found" });
            return;
        }
        res.json({ success: true, data: role });
    } catch (error) {
        next(error);
    }
};
// Get Role by Name
export const getRoleByName = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        const { name } = req.params;
        const role = await prisma.role.findUnique({
            where: { name },
            include: { permissions: { include: { permission: true } } }
        });

        if (!role){
            res.status(404).json({ success: false, message: "Role not found" });
            return;
        }
        res.json({ success: true, data: role });
    } catch (error) {
        next(error);
    }
};

// Get All Roles
export const getAllRoles = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const roles = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
        res.json({ success: true, data: roles });
    } catch (error) {
        next(error);
    }
};

// Get Role with All Permissions
export const getRoleWithPermissions = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        const { id } = req.params;
        const role = await prisma.role.findUnique({
            where: { id },
            include: { permissions: { include: { permission: true } } }
        });

        if (!role){
            res.status(404).json({ success: false, message: "Role with permissions not found" });
            return;
        }
        res.json({ success: true, data: role });
    } catch (error) {
        next(error);
    }
};

// Assign Permissions to Role
export const assignPermissionsToRole = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        const { roleId, permissionId } = req.body;

        const role = await prisma.role.findUnique({ where: { id: roleId } });
        if (!role){
            res.status(404).json({ success: false, message: "Role not found" });
            return;
        }

        await prisma.rolePermission.deleteMany({ where: { roleId } });
        await prisma.rolePermission.createMany({
            data: permissionId.map((permissionId: string) => ({ roleId, permissionId }))
        });

        res.json({ success: true, message: "Permissions assigned to role" });
    } catch (error) {
        next(error);
    }
};

// Create Permission
export const createPermission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;

        const newPermission = await prisma.permission.create({
            data: {
                id: uuidv4(),
                name
            }
        });

        res.status(201).json({ success: true, message: "Permission created", data: newPermission });
    } catch (error) {
        next(error);
    }
};

// Update Permission
export const updatePermission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: { name }
        });

        res.json({ success: true, message: "Permission updated", data: updatedPermission });
    } catch (error) {
        next(error);
    }
};

// Get Permission by ID
export const getPermissionById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        const { id } = req.params;
        const permission = await prisma.permission.findUnique({ where: { id } });

        if (!permission) {
            res.status(404).json({ success: false, message: "Permission not found" });
            return;
        }
        res.json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
};

// Get Permission by Name
export const getPermissionByName = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
        const { name } = req.params;
        const permission = await prisma.permission.findUnique({ where: { name } });

        if (!permission) {
            res.status(404).json({ success: false, message: "Permission not found" });
            return;
        }
        res.json({ success: true, data: permission });
    } catch (error) {
        next(error);
    }
};

// Get All Permissions
export const getAllPermissions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json({ success: true, data: permissions });
    } catch (error) {
        next(error);
    }
};