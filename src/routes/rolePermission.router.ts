import express from 'express';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';

import { createPermissionSectionSchema, getAllPermissionSectionsQuerySchema, togglePermissionSectionStatusSchema, updatePermissionSectionSchema } from '../validators/permissionSection.validator';
import { createPermissionSection, getAllPermissionSections, getAllPermissionSectionsComplete, getPermissionSectionById, togglePermissionSectionStatus, updatePermissionSection } from '../controllers/permissionSection.controller';
import { createModuleGroup, getAllModuleGroups, getAllModuleGroupsComplete, getModuleGroupById, toggleModuleGroupStatus, updateModuleGroup } from '../controllers/moduleGroup.controller';
import { createModuleGroupSchema, getAllModuleGroupsQuerySchema, toggleModuleGroupStatusSchema, updateModuleGroupSchema } from '../validators/moduleGroup.validator';


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



export default roleRouter;
