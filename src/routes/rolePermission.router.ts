import express from 'express';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateQuery } from '../middleware/validateQuery.middleware';

import { createPermissionSectionSchema, getAllPermissionSectionsQuerySchema, togglePermissionSectionStatusSchema, updatePermissionSectionSchema } from '../validators/permissionSection.validator';
import { createPermissionSection, getAllPermissionSections, getPermissionSectionById, togglePermissionSectionStatus, updatePermissionSection } from '../controllers/permissionSection.controller';


const roleRouter = express.Router();

// ✅ Permission Group Routes



// ✅ PERMISSION SECTION ROUTES
roleRouter.post('/permission-sections', validate(createPermissionSectionSchema), createPermissionSection);
roleRouter.put('/permission-sections/:id', validate(updatePermissionSectionSchema), updatePermissionSection);
roleRouter.patch('/permission-sections/:id/status', validate(togglePermissionSectionStatusSchema), togglePermissionSectionStatus);
roleRouter.get('/permission-sections', validateQuery(getAllPermissionSectionsQuerySchema), getAllPermissionSections);
roleRouter.get('/permission-sections/:id', getPermissionSectionById);



export default roleRouter;
