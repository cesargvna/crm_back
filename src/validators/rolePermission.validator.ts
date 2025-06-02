// src/validators/rolePermission.validator.ts
import { z } from "zod";

// ==============================
// ✅ Permission Section
// ==============================
export const createPermissionSectionSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  order: z.number({ invalid_type_error: "Order must be a number" })
    .int("Order must be an integer")
    .nonnegative("Order must be non-negative")
    .optional(),
});

export const updatePermissionSectionSchema = createPermissionSectionSchema.extend({
  id: z.string({ required_error: "Section ID is required" }).uuid("Invalid section ID"),
});

export const togglePermissionSectionStatusSchema = z.object({
  id: z.string({ required_error: "Section ID is required" }).uuid("Invalid section ID"),
});

export const getAllPermissionSectionsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform((v) => parseInt(v || "1")),
  limit: z.string().optional().transform((v) => parseInt(v || "10")),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
  sortBy: z.enum(["name", "order", "created_at"]).optional().default("order"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// ==============================
// ✅ Module Group
// ==============================
export const createModuleGroupSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  route: z.string({ required_error: "Route is required" })
    .min(1, { message: "Route must be at least 1 character" })
    .max(255, { message: "Route must be at most 255 characters" }),
  iconName: z.string({ required_error: "Icon name is required" })
    .min(1, { message: "Icon name must be at least 1 character" })
    .max(100, { message: "Icon name must be at most 100 characters" }),
  sectionId: z.string({ required_error: "Section ID is required" }).uuid("Invalid section ID"),
});

export const updateModuleGroupSchema = createModuleGroupSchema.extend({
  id: z.string({ required_error: "Module ID is required" }).uuid("Invalid module ID"),
});

export const toggleModuleGroupStatusSchema = z.object({
  id: z.string({ required_error: "Module ID is required" }).uuid("Invalid module ID"),
});

export const getAllModuleGroupsQuerySchema = getAllPermissionSectionsQuerySchema.extend({
  sortBy: z.enum(["name", "created_at"]).optional().default("name"),
});

// ==============================
// ✅ Submodule Group
// ==============================
export const createSubmoduleGroupSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  route: z.string({ required_error: "Route is required" })
    .min(1, { message: "Route must be at least 1 character" })
    .max(255, { message: "Route must be at most 255 characters" }),
  moduleId: z.string({ required_error: "Module ID is required" }).uuid("Invalid module ID"),
});

export const updateSubmoduleGroupSchema = createSubmoduleGroupSchema.extend({
  id: z.string({ required_error: "Submodule ID is required" }).uuid("Invalid submodule ID"),
});

export const toggleSubmoduleGroupStatusSchema = z.object({
  id: z.string({ required_error: "Submodule ID is required" }).uuid("Invalid submodule ID"),
});

export const getAllSubmoduleGroupsQuerySchema = getAllModuleGroupsQuerySchema;

// ==============================
// ✅ Permission Action
// ==============================
export const createPermissionActionSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be at most 50 characters" }),
});

export const updatePermissionActionSchema = createPermissionActionSchema.extend({
  id: z.string({ required_error: "Action ID is required" }).uuid("Invalid action ID"),
});

export const getAllPermissionActionsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform((v) => parseInt(v || "1")),
  limit: z.string().optional().transform((v) => parseInt(v || "10")),
  sortBy: z.enum(["name", "created_at"]).optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// ==============================
// ✅ Role
// ==============================
export const createRoleSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  description: z.string().max(255, { message: "Description must be at most 255 characters" }).optional().nullable(),
});

export const updateRoleSchema = createRoleSchema.extend({
  id: z.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
});

export const toggleRoleStatusSchema = z.object({
  id: z.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
});

export const getAllRolesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform((v) => parseInt(v || "1")),
  limit: z.string().optional().transform((v) => parseInt(v || "10")),
  sortBy: z.enum(["name", "created_at"]).optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  status: z.enum(["true", "false", "all"]).optional().default("all"),
});

// ==============================
// ✅ Assign Permissions to Role
// ==============================
export const assignPermissionsSchema = z.object({
  roleId: z.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
  permissions: z
    .array(
      z.object({
        sectionId: z.string({ required_error: "Section ID is required" }).uuid("Invalid section ID"),
        actionId: z.string({ required_error: "Action ID is required" }).uuid("Invalid action ID"),
      })
    )
    .min(1, { message: "At least one permission is required" }),
});
