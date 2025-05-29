import express from 'express';
import {
  createPermissionGroup,
  updatePermissionGroup,
  getAllGroups,
  createPermissionAction,
  updatePermissionAction,
  getAllActions,
  createRole,
  updateRole,
  toggleRoleStatus,
  assignPermissionsToRole,
  getRoleWithPermissions,
  getAllRoles,
} from '../controllers/rolePermission.controller';

import {
  createPermissionGroupSchema,
  updatePermissionGroupSchema, 
  createPermissionActionSchema,
  updatePermissionActionSchema,
  createRoleSchema,
  updateRoleSchema,
  toggleRoleStatusSchema,
  assignPermissionsSchema,
  getAllRolesQuerySchema,
} from '../validators/rolePermission.validator';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';

const roleRouter = express.Router();

// ✅ Permission Group Routes
roleRouter.post('/groups', validate(createPermissionGroupSchema), createPermissionGroup);
roleRouter.put('/groups', validate(updatePermissionGroupSchema), updatePermissionGroup);
roleRouter.get('/groups', getAllGroups);

// ✅ Permission Action Routes
roleRouter.post('/actions', validate(createPermissionActionSchema), createPermissionAction);
roleRouter.put('/actions', validate(updatePermissionActionSchema), updatePermissionAction);
roleRouter.get('/actions', getAllActions);

// ✅ Role Routes
roleRouter.post('/roles', validate(createRoleSchema), createRole);
roleRouter.put('/roles', validate(updateRoleSchema), updateRole);
roleRouter.patch('/roles/:id/toggle', validateParams(toggleRoleStatusSchema), toggleRoleStatus);
roleRouter.get('/roles/:id', getRoleWithPermissions);

// ✅ Role Permission Assignment
roleRouter.post('/roles/assign', validate(assignPermissionsSchema), assignPermissionsToRole);
roleRouter.get('/roles', validateQuery(getAllRolesQuerySchema), getAllRoles);

export default roleRouter;
