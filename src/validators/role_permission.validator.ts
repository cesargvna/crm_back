import { z } from "zod";

// Esquema de validación para Role
export const roleSchema = z.object({
    name: z
        .string()
        .min(2, "Role name must have at least 2 characters.")
        .max(50, "Role name must not exceed 50 characters.")
        .nonempty("Role name is required."),
    
    status: z.boolean().optional(),
    permissions: z.array(z.string()).nonempty("Permissions must are one or more."),
});

// Esquema de validación para Permission
export const permissionSchema = z.object({
    name: z
        .string()
        .min(2, "Permission name must have at least 2 characters.")
        .max(50, "Permission name must not exceed 50 characters.")
        .nonempty("Permission name is required."),
});

// Esquema de validación para RolePermission (relación entre roles y permisos)
export const rolePermissionSchema = z.object({
    roleId: z.string().nonempty("Role ID is required."),
    permissionId: z.array(z.string()).nonempty("Permission ID is required."),
});