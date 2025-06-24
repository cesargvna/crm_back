import express from 'express';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';

import { createPermissionSectionSchema, getAllPermissionSectionsQuerySchema, togglePermissionSectionStatusSchema, updatePermissionSectionSchema } from '../validators/permissionSection.validator';
import { createPermissionSection, getAllPermissionSections, getAllPermissionSectionsComplete, getPermissionSectionById, togglePermissionSectionStatus, updatePermissionSection } from '../controllers/permissionSection.controller';
import { createModuleGroup, getAllModuleGroups, getAllModuleGroupsComplete, getModuleGroupById, toggleModuleGroupStatus, updateModuleGroup } from '../controllers/moduleGroup.controller';
import { createModuleGroupSchema, getAllModuleGroupsQuerySchema, toggleModuleGroupStatusSchema, updateModuleGroupSchema } from '../validators/moduleGroup.validator';
import { createSubmoduleGroupSchema, getAllSubmoduleGroupsQuerySchema, toggleSubmoduleGroupStatusSchema, updateSubmoduleGroupSchema } from '../validators/submoduleGroup.validator';
import { createSubmoduleGroup, getAllSubmoduleGroups, getAllSubmoduleGroupsComplete, getSubmoduleGroupById, toggleSubmoduleGroupStatus, updateSubmoduleGroup } from '../controllers/submoduleGroup.controller';
import { createPermissionActionSchema, updatePermissionActionSchema } from '../validators/permissionAction.validator';
import { createPermissionAction, getAllPermissionActions, getPermissionActionById, updatePermissionAction } from '../controllers/permissionAction.controller';
import { createRoleSchema, getAllRolesQuerySchema, updateRoleSchema } from '../validators/role.validator';
import { createRole, getRoleById, getRolesBySubsidiary, getRolesByTenant, getRoleWithPermissions, toggleRoleStatus, updateRole } from '../controllers/role.controller';
import { assignRolePermissionsSchema, createRolePermissionSchema, deleteRolePermissionParamsSchema, getRolePermissionParamsSchema } from '../validators/rolePermission.validator';
import { assignRolePermissions, createRolePermission, deleteRolePermission, getRolePermissionsByRoleId, getRolePermissionsBySubsidiaryId, getRolePermissionsByTenantId, getSidebarPermissionsByRoleId } from '../controllers/rolePermission.controller';

const roleRouter = express.Router();

// ✅ PERMISSION SECTION ROUTES
roleRouter.post('/permission-sections', validate(createPermissionSectionSchema), createPermissionSection);
roleRouter.put('/permission-sections/:id', validate(updatePermissionSectionSchema), updatePermissionSection);
roleRouter.patch('/permission-sections/:id/status', validate(togglePermissionSectionStatusSchema), togglePermissionSectionStatus);
roleRouter.get('/permission-sections', validateQuery(getAllPermissionSectionsQuerySchema), getAllPermissionSections);
roleRouter.get('/permission-sections/:id', getPermissionSectionById);
roleRouter.get('/permission-sections-complete', getAllPermissionSectionsComplete);

// ✅ PERMISSION MODULE ROUTES
roleRouter.post('/permission-module', validate(createModuleGroupSchema), createModuleGroup);
roleRouter.put('/permission-module/:id', validate(updateModuleGroupSchema), updateModuleGroup);
roleRouter.patch('/permission-module/:id/status', validate(toggleModuleGroupStatusSchema), toggleModuleGroupStatus);
roleRouter.get('/permission-module', validateQuery(getAllModuleGroupsQuerySchema), getAllModuleGroups);
roleRouter.get('/permission-module/:id', getModuleGroupById);
roleRouter.get('/permission-module-complete', getAllModuleGroupsComplete);

// ✅ PERMISSION SUBMODULE ROUTES
roleRouter.post('/permission-submodule', validate(createSubmoduleGroupSchema), createSubmoduleGroup);
roleRouter.put('/permission-submodule/:id', validate(updateSubmoduleGroupSchema), updateSubmoduleGroup);
roleRouter.patch('/permission-submodule/:id/status', validate(toggleSubmoduleGroupStatusSchema), toggleSubmoduleGroupStatus);
roleRouter.get('/permission-submodule', validateQuery(getAllSubmoduleGroupsQuerySchema), getAllSubmoduleGroups);
roleRouter.get('/permission-submodule/:id', getSubmoduleGroupById);
roleRouter.get('/permission-submodule-complete', getAllSubmoduleGroupsComplete);

// ✅ PERMISSION ACTION ROUTES
roleRouter.post('/permission-actions', validate(createPermissionActionSchema), createPermissionAction);
roleRouter.put('/permission-actions/:id', validate(updatePermissionActionSchema), updatePermissionAction);
roleRouter.get('/permission-actions', getAllPermissionActions);
roleRouter.get('/permission-actions/:id', getPermissionActionById);

// ✅ ROLE ROUTES
roleRouter.post("/roles", validate(createRoleSchema), createRole);
roleRouter.put("/roles/:id", validate(updateRoleSchema), updateRole);
roleRouter.patch("/roles/:id/status", toggleRoleStatus);
roleRouter.get("/roles/:id/permissions",  getRoleWithPermissions); 
roleRouter.get("/roles/:id",getRoleById);
roleRouter.get("/roles/by-subsidiary/:subsidiaryId",validateQuery(getAllRolesQuerySchema),getRolesBySubsidiary);
roleRouter.get("/roles/by-tenant/:tenantId", getRolesByTenant);

// ✅ ROLE PERMISSION ROUTES
roleRouter.post("/rolePermission",validate(createRolePermissionSchema),createRolePermission);
roleRouter.post("/role-permissions/assign", validate(assignRolePermissionsSchema), assignRolePermissions);
roleRouter.get("/rolePermission/:roleId",validateParams(getRolePermissionParamsSchema),getRolePermissionsByRoleId);
roleRouter.delete("/rolePermission/:id",validateParams(deleteRolePermissionParamsSchema),deleteRolePermission);
roleRouter.get("/role-permissions/by-tenant/:tenantId", getRolePermissionsByTenantId);
roleRouter.get("/role-permissions/by-subsidiary/:subsidiaryId", getRolePermissionsBySubsidiaryId);
roleRouter.get("/role-permission/sidebar/:roleId", getSidebarPermissionsByRoleId);

export default roleRouter;
