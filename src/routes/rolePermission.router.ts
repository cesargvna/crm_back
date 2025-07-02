import express from 'express';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';



import { createPermissionActionSchema, updatePermissionActionSchema } from '../validators/permissionAction.validator';
import { createPermissionAction, getAllPermissionActions, getPermissionActionById, togglePermissionActionStatus, updatePermissionAction } from '../controllers/permissionAction.controller';
import { createRoleSchema, getAllRolesQuerySchema, updateRoleSchema } from '../validators/role.validator';
import { createRole, getRoleById, getRolesBySubsidiary, getRolesBySubsidiaryComplete, getRolesByTenant, getRoleWithPermissions, toggleRoleStatus, updateRole } from '../controllers/role.controller';

import { createSection, getHiddenSections, getSidebarSectionsByRole, getVisibleSections, toggleSectionVisibility, updateSection } from '../controllers/section.controller';
import { createSectionSchema, roleIdParamSchema, toggleSectionVisibilitySchema, updateSectionSchema } from '../validators/section.validator';
import { createModule, getModuleById, updateModule } from '../controllers/module.controller';
import { createModuleSchema, updateModuleSchema } from '../validators/module.validator';
import { createSubmoduleSchema, updateSubmoduleSchema } from '../validators/submodule.validator';
import { createSubmodule, getSubmoduleById, updateSubmodule } from '../controllers/submodule.controller';
import { createAllowedActionSchema, getAllAllowedActionsQuerySchema } from '../validators/allowedAction.validator';
import { createAllowedAction, deleteAllowedAction, getAllAllowedActions } from '../controllers/allowedAction.controller';
import { createRolePermissionSchema, getRolePermissionsQuerySchema } from '../validators/rolePermission.validator';
import { createRolePermission, deleteRolePermission, getRolePermissions,  } from '../controllers/rolePermission.controller';
import { validateTenantLimit } from '../middleware/validateTenantLimits';

const roleRouter = express.Router();

// ✅ SECTION
roleRouter.post('/sections', validate(createSectionSchema), createSection);
roleRouter.put('/sections/:id', validate(updateSectionSchema), updateSection);
roleRouter.patch('/sections/:id/visibility', validate(toggleSectionVisibilitySchema), toggleSectionVisibility);
roleRouter.get('/sections/visible', getVisibleSections);
roleRouter.get('/sections/hidden', getHiddenSections);
roleRouter.get('/sections/sidebar/:roleId', validateParams(roleIdParamSchema), getSidebarSectionsByRole);

// ✅ MODULE
roleRouter.post('/module', validate(createModuleSchema), createModule);
roleRouter.put('/module/:id', validate(updateModuleSchema), updateModule);
roleRouter.get('/module/:id', getModuleById);

// ✅ SUBMODULE
roleRouter.post('/submodule', validate(createSubmoduleSchema), createSubmodule);
roleRouter.put('/submodule/:id', validate(updateSubmoduleSchema), updateSubmodule);
roleRouter.get('/submodule/:id', getSubmoduleById);

// ✅ PERMISSION ACTION ROUTES
roleRouter.post('/permission-action', validate(createPermissionActionSchema), createPermissionAction);
roleRouter.put('/permission-action/:id', validate(updatePermissionActionSchema), updatePermissionAction);
roleRouter.patch('/permission-action/:id/status', togglePermissionActionStatus);
roleRouter.get('/permission-action', getAllPermissionActions);
roleRouter.get('/permission-action/:id', getPermissionActionById);

// ✅ ALLOWED ACTION
roleRouter.post('/allowed-action', validate(createAllowedActionSchema), createAllowedAction);
roleRouter.get('/allowed-action', validateQuery(getAllAllowedActionsQuerySchema), getAllAllowedActions);
roleRouter.delete('/allowed-action/:id', deleteAllowedAction);

// ✅ ROLE ROUTES
roleRouter.post("/roles", validateTenantLimit("role"), validate(createRoleSchema), createRole);
roleRouter.put("/roles/:id", validate(updateRoleSchema), updateRole);
roleRouter.patch("/roles/:id/status", toggleRoleStatus);
roleRouter.get("/roles/:id/permissions",  getRoleWithPermissions); 
roleRouter.get("/roles/:id",getRoleById);
roleRouter.get("/rolesBySubsidiaryComplete/:subsidiaryId",validateQuery(getAllRolesQuerySchema),getRolesBySubsidiaryComplete);
roleRouter.get("/rolesByTenant/:tenantId", getRolesByTenant);
roleRouter.get("/rolesBySubsidiary/:subsidiaryId", getRolesBySubsidiary);

// ✅ ROLE PERMISSION ROUTES
roleRouter.post("/roles/:roleId/permissions", validate(createRolePermissionSchema), createRolePermission);
roleRouter.get("/roles/:roleId/permissions-list", getRolePermissions);
roleRouter.delete("/role-permission/:id", deleteRolePermission);

export default roleRouter;
