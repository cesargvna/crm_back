// src/routes/rolePermission.router.ts
import { Router } from 'express';
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
  toggleGroupStatusSchema,
  createPermissionActionSchema,
  updatePermissionActionSchema,
  toggleActionStatusSchema,
  createRoleSchema,
  updateRoleSchema,
  toggleRoleStatusSchema,
  assignPermissionsSchema,
  
} from '../validators/rolePermission.validator';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';

const router = Router();

// ✅ Permission Group Routes
router.post('/groups', validate(createPermissionGroupSchema), createPermissionGroup);
router.put('/groups', validate(updatePermissionGroupSchema), updatePermissionGroup);
router.get('/groups', getAllGroups);

// ✅ Permission Action Routes
router.post('/actions', validate(createPermissionActionSchema), createPermissionAction);
router.put('/actions', validate(updatePermissionActionSchema), updatePermissionAction);
router.get('/actions', getAllActions);

// ✅ Role Routes
router.post('/roles', validate(createRoleSchema), createRole);
router.put('/roles', validate(updateRoleSchema), updateRole);
router.patch('/roles/:id/toggle', validateParams(toggleRoleStatusSchema), toggleRoleStatus);
router.get('/roles/:id', getRoleWithPermissions);

// ✅ Role Permission Assignment
router.post('/roles/assign', validate(assignPermissionsSchema), assignPermissionsToRole);
router.get('/roles', getAllRoles); 

export default router;
