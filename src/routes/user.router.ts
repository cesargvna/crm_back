import express from 'express';
const userRouter = express.Router();

import {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  toggleUserStatus,
} from '../controllers/user.controller';

import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { userSchema, toggleUserStatusSchema, getAllUsersQuerySchema } from '../validators/user.validator';
import { validateQuery } from "../middleware/validateQuery.middleware";

import { authenticate } from '../middleware/auth.middleware'; // ✅ Agregar
import { injectTenantId } from '../middleware/injectTenantId.middleware'; // ✅ Agregar

// ✅ Aplica en creación y edición
userRouter.post('/', authenticate, injectTenantId, validate(userSchema), createUser);
userRouter.put('/:id', authenticate, injectTenantId, validate(userSchema), updateUser);

// ✅ Solo autenticación para leer
userRouter.get("/", authenticate, validateQuery(getAllUsersQuerySchema), getAllUsers);
userRouter.get('/:id', authenticate, getUserById);

// ✅ Autenticación + validación en toggle
userRouter.patch('/:id/toggle', authenticate, validateParams(toggleUserStatusSchema), toggleUserStatus);

export default userRouter;
