// src/validators/rolePermission.validator.ts
import { z } from "zod";

// ✅ Validaciones de Role
export const createRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(20, "Name must be at most 20 characters"),
  description: z.string().max(100, "Description must be at most 100 characters").optional(),
});

export const updateRoleSchema = z.object({
  id: z.string().uuid("Invalid role ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(20, "Name must be at most 20 characters").optional(),
  description: z.string().max(100, "Description must be at most 100 characters").optional(),
});

export const toggleRoleStatusSchema = z.object({
  id: z.string().uuid("Invalid role ID"),
});

// ✅ Validaciones de PermissionGroup
export const createPermissionGroupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  type: z.string().min(2, "Type must be at least 2 characters").max(20, "Type must be at most 20 characters"),
});

export const updatePermissionGroupSchema = z.object({
  id: z.string().uuid("Invalid group ID"),
  name: z.string().min(2).max(100),
  type: z.string().min(2).max(20),
});

export const toggleGroupStatusSchema = z.object({
  id: z.string().uuid("Invalid group ID"),
});

// ✅ Validaciones de PermissionAction
export const createPermissionActionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(20, "Name must be at most 20 characters"),
});

export const updatePermissionActionSchema = z.object({
  id: z.string().uuid("Invalid action ID"),
  name: z.string().min(2).max(20),
});

export const toggleActionStatusSchema = z.object({
  id: z.string().uuid("Invalid action ID"),
});

// ✅ Validación para asignar permisos
export const assignPermissionsSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
  permissions: z
    .array(
      z.object({
        groupId: z.string().uuid("Invalid group ID"),
        actionId: z.string().uuid("Invalid action ID"),
      })
    )
    .min(1, "At least one permission is required"),
});
