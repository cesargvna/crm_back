import express from "express";
const userRouter = express.Router();

import {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  toggleUserStatus,
} from "../controllers/user.controller";

import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import {
  userSchema,
  updateUserSchema,
  toggleUserStatusSchema,
  getAllUsersQuerySchema,
} from "../validators/user.validator";
import { validateQuery } from "../middleware/validateQuery.middleware";

import { authenticate } from "../middleware/auth.middleware";
import { injectTenantId } from "../middleware/injectTenantId.middleware";

// ✅ Crear usuario
userRouter.post(
  "/",
  authenticate,
  injectTenantId,
  validate(userSchema),
  createUser
);

// ✅ Actualizar usuario (usa updateUserSchema)
userRouter.put(
  "/:id",
  authenticate,
  injectTenantId,
  validate(updateUserSchema),
  updateUser
);

// ✅ Obtener todos los usuarios
userRouter.get(
  "/",
  authenticate,
  validateQuery(getAllUsersQuerySchema),
  getAllUsers
);

// ✅ Obtener usuario por ID
userRouter.get("/:id", authenticate, getUserById);

// ✅ Cambiar estado del usuario
userRouter.patch(
  "/:id/toggle",
  authenticate,
  validateParams(toggleUserStatusSchema),
  toggleUserStatus
);

export default userRouter;
