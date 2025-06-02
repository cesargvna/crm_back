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
  assignPermissionsToRole
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
  assignPermissionsSchema
} from '../validators/rolePermission.validator';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const roleRouter = express.Router();

// ✅ Permission Section
roleRouter.post('/sections', validate(createPermissionSectionSchema), asyncHandler(createPermissionSection));
roleRouter.put('/sections', validate(updatePermissionSectionSchema), asyncHandler(updatePermissionSection));
roleRouter.patch('/sections/:id/toggle', validateParams(togglePermissionSectionStatusSchema), asyncHandler(togglePermissionSectionStatus));
roleRouter.get('/sections', validateQuery(getAllPermissionSectionsQuerySchema), asyncHandler(getAllPermissionSections));
roleRouter.get('/sections/:id', asyncHandler(getPermissionSectionById));

// ✅ Module Group
roleRouter.post('/modules', validate(createModuleGroupSchema), asyncHandler(createModuleGroup));
roleRouter.put('/modules', validate(updateModuleGroupSchema), asyncHandler(updateModuleGroup));
roleRouter.patch('/modules/:id/toggle', validateParams(toggleModuleGroupStatusSchema), asyncHandler(toggleModuleGroupStatus));
roleRouter.get('/modules', validateQuery(getAllModuleGroupsQuerySchema), asyncHandler(getAllModuleGroups));
roleRouter.get('/modules/:id', asyncHandler(getModuleGroupById));

// ✅ Submodule Group
roleRouter.post('/submodules', validate(createSubmoduleGroupSchema), asyncHandler(createSubmoduleGroup));
roleRouter.put('/submodules', validate(updateSubmoduleGroupSchema), asyncHandler(updateSubmoduleGroup));
roleRouter.patch('/submodules/:id/toggle', validateParams(toggleSubmoduleGroupStatusSchema), asyncHandler(toggleSubmoduleGroupStatus));
roleRouter.get('/submodules', validateQuery(getAllSubmoduleGroupsQuerySchema), asyncHandler(getAllSubmoduleGroups));
roleRouter.get('/submodules/:id', asyncHandler(getSubmoduleGroupById));

// ✅ Permission Action
roleRouter.post('/actions', validate(createPermissionActionSchema), asyncHandler(createPermissionAction));
roleRouter.put('/actions', validate(updatePermissionActionSchema), asyncHandler(updatePermissionAction));
roleRouter.get('/actions', validateQuery(getAllPermissionActionsQuerySchema), asyncHandler(getAllPermissionActions));

// ✅ Role
roleRouter.post('/roles', validate(createRoleSchema), asyncHandler(createRole));
roleRouter.put('/roles', validate(updateRoleSchema), asyncHandler(updateRole));
roleRouter.patch('/roles/:id/toggle', validateParams(toggleRoleStatusSchema), asyncHandler(toggleRoleStatus));
roleRouter.get('/roles/:id', asyncHandler(getRoleWithPermissions));
roleRouter.get('/roles', validateQuery(getAllRolesQuerySchema), asyncHandler(getAllRoles));

// ✅ Assign Permissions
roleRouter.post('/roles/assign', validate(assignPermissionsSchema), asyncHandler(assignPermissionsToRole));

export default roleRouter;
