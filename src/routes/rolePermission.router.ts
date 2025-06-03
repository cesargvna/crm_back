// src/routes/rolePermission.router.ts
import express from 'express';
import {
  createPermissionSection,
  updatePermissionSection,
  togglePermissionSectionStatus,
  getAllPermissionSections,
  getPermissionSectionById,

  createModuleGroup,
  updateModuleGroup,
  toggleModuleGroupStatus,
  getAllModuleGroups,
  getModuleGroupById,

  createSubmoduleGroup,
  updateSubmoduleGroup,
  toggleSubmoduleGroupStatus,
  getAllSubmoduleGroups,
  getSubmoduleGroupById,

  createPermissionAction,
  updatePermissionAction,
  getAllPermissionActions,

  createRole,
  updateRole,
  toggleRoleStatus,
  getRoleWithPermissions,
  getAllRoles,
  addPermissionsToRole,
  removeMultiplePermissionsFromRole,
  getPermissionsByRoleId
} from '../controllers/rolePermission.controller';

import {
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  togglePermissionSectionStatusSchema,
  getAllPermissionSectionsQuerySchema,

  createModuleGroupSchema,
  updateModuleGroupSchema,
  toggleModuleGroupStatusSchema,
  getAllModuleGroupsQuerySchema,

  createSubmoduleGroupSchema,
  updateSubmoduleGroupSchema,
  toggleSubmoduleGroupStatusSchema,
  getAllSubmoduleGroupsQuerySchema,

  createPermissionActionSchema,
  updatePermissionActionSchema,
  getAllPermissionActionsQuerySchema,

  createRoleSchema,
  updateRoleSchema,
  toggleRoleStatusSchema,
  getAllRolesQuerySchema,
  assignPermissionsSchema,
  removeMultiplePermissionsSchema
} from '../validators/rolePermission.validator';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';
import { asyncHandler } from '../utils/asyncHandler';

import { authenticate } from "../middleware/auth.middleware";
import { injectTenantId } from "../middleware/injectTenantId.middleware";

const roleRouter = express.Router();

// ✅ Permission Section
roleRouter.post('/sections', authenticate, validate(createPermissionSectionSchema), asyncHandler(createPermissionSection));
roleRouter.put('/sections', authenticate, validate(updatePermissionSectionSchema), asyncHandler(updatePermissionSection));
roleRouter.patch('/sections/:id/toggle', authenticate, validateParams(togglePermissionSectionStatusSchema), asyncHandler(togglePermissionSectionStatus));
roleRouter.get('/sections', authenticate, validateQuery(getAllPermissionSectionsQuerySchema), asyncHandler(getAllPermissionSections));
roleRouter.get('/sections/:id', authenticate, asyncHandler(getPermissionSectionById));

// ✅ Module Group
roleRouter.post('/modules', authenticate, validate(createModuleGroupSchema), asyncHandler(createModuleGroup));
roleRouter.put('/modules', authenticate, validate(updateModuleGroupSchema), asyncHandler(updateModuleGroup));
roleRouter.patch('/modules/:id/toggle', authenticate, validateParams(toggleModuleGroupStatusSchema), asyncHandler(toggleModuleGroupStatus));
roleRouter.get('/modules', authenticate, validateQuery(getAllModuleGroupsQuerySchema), asyncHandler(getAllModuleGroups));
roleRouter.get('/modules/:id', authenticate, asyncHandler(getModuleGroupById));

// ✅ Submodule Group
roleRouter.post('/submodules', authenticate, validate(createSubmoduleGroupSchema), asyncHandler(createSubmoduleGroup));
roleRouter.put('/submodules', authenticate, validate(updateSubmoduleGroupSchema), asyncHandler(updateSubmoduleGroup));
roleRouter.patch('/submodules/:id/toggle', authenticate, validateParams(toggleSubmoduleGroupStatusSchema), asyncHandler(toggleSubmoduleGroupStatus));
roleRouter.get('/submodules', authenticate, validateQuery(getAllSubmoduleGroupsQuerySchema), asyncHandler(getAllSubmoduleGroups));
roleRouter.get('/submodules/:id', authenticate, asyncHandler(getSubmoduleGroupById));

// ✅ Permission Action
roleRouter.post('/actions', authenticate, validate(createPermissionActionSchema), asyncHandler(createPermissionAction));
roleRouter.put('/actions', authenticate, validate(updatePermissionActionSchema), asyncHandler(updatePermissionAction));
roleRouter.get('/actions', authenticate, validateQuery(getAllPermissionActionsQuerySchema), asyncHandler(getAllPermissionActions));

// ✅ Role
roleRouter.post('/roles', authenticate, injectTenantId, validate(createRoleSchema), asyncHandler(createRole));
roleRouter.put('/roles', authenticate, injectTenantId, validate(updateRoleSchema), asyncHandler(updateRole));
roleRouter.patch('/roles/:id/toggle', authenticate, injectTenantId, validateParams(toggleRoleStatusSchema), asyncHandler(toggleRoleStatus));
roleRouter.get('/roles/:id', authenticate, asyncHandler(getRoleWithPermissions));
roleRouter.get('/roles', authenticate, validateQuery(getAllRolesQuerySchema), asyncHandler(getAllRoles));
roleRouter.get('/roles/:id/permissions', authenticate, asyncHandler(getPermissionsByRoleId));

// ✅ Assign Permissions
roleRouter.post("/roles/assign", authenticate, injectTenantId, validate(assignPermissionsSchema), asyncHandler(addPermissionsToRole));
roleRouter.delete("/roles/permissions/bulk-remove", authenticate, injectTenantId, validate(removeMultiplePermissionsSchema), asyncHandler(removeMultiplePermissionsFromRole));

export default roleRouter;
