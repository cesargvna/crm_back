import express from 'express';
const rolePermissionRouter = express.Router();
import { validate } from '../middleware/validate.middleware';
import { roleSchema } from '../validators/role_permission.validator';
import { permissionSchema } from '../validators/role_permission.validator';
import { rolePermissionSchema } from '../validators/role_permission.validator';

import { 
    createRole, 
    getRoleById, 
    getRoleByName, 
    getAllRoles, 
    getRoleWithPermissions, 
    updateRole, 
    deleteRole, 
    createPermission,
    getPermissionById,
    getPermissionByName,
    getAllPermissions,
    updatePermission,
    assignPermissionsToRole
 } from '../controllers/role_permissions.controller';

 rolePermissionRouter.post("/permission", validate(permissionSchema), createPermission);
rolePermissionRouter.get("/permission/:id", getPermissionById);
rolePermissionRouter.get("/permission/:name", getPermissionByName);
rolePermissionRouter.get("/permission/", getAllPermissions);
rolePermissionRouter.put("/permission/:id", validate(permissionSchema), updatePermission);
rolePermissionRouter.post("/assign-permissions", validate(rolePermissionSchema), assignPermissionsToRole);
rolePermissionRouter.get("/role-permissions/:id", getRoleWithPermissions);
rolePermissionRouter.post("/", validate(roleSchema), createRole);
rolePermissionRouter.get("/:id", getRoleById);
rolePermissionRouter.get("/:name", getRoleByName);
rolePermissionRouter.get("/", getAllRoles);
rolePermissionRouter.put("/:id", validate(roleSchema), updateRole);
rolePermissionRouter.delete("/:id", deleteRole);


export default rolePermissionRouter;