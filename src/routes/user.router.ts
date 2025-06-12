import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { getAllUsersQuerySchema, getUserByIdParamsSchema, toggleUserStatusSchema, updateUserPasswordSchema, userSchema } from '../validators/user.validator';
import { createUser, getAllUsersByTenantId, getUserById, getUsersBySubsidiary, toggleUserStatus, updateUser, updateUserPassword } from '../controllers/user.controller';



const userRouter = express.Router();

userRouter.post("/", validate(userSchema), createUser);
userRouter.get("/:id", getUserById);
userRouter.get("/by-tenant/:tenantId", validate(getAllUsersQuerySchema), getAllUsersByTenantId);
userRouter.get("/by-subsidiary/:subsidiaryId", validate(getAllUsersQuerySchema), getUsersBySubsidiary);
userRouter.put("/:id", validate(userSchema.omit( {username: true,password: true,subsidiaryId: true} )), updateUser);
userRouter.patch("/:id/status", toggleUserStatus);
userRouter.patch("/:id/password", validate(updateUserPasswordSchema), updateUserPassword);



export default userRouter;