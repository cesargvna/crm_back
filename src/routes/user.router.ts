import express from 'express';
import { validate } from '../middleware/validate.middleware';

import { createScheduleUserSchema,  updateScheduleUserSchema } from '../validators/scheduleUser.validator';
import { createScheduleUser, deleteScheduleUser, getSchedulesByUser, getScheduleUserById, toggleScheduleUserStatus, updateScheduleUser } from '../controllers/scheduleUser.controller';
import { createUser, getUserById, getUserByIdSimple, getUsersBySubsidiary, toggleUserStatus, updateUser, updateUserPassword } from '../controllers/user.controller';
import { createUserSchema, getAllUsersQuerySchema, toggleUserStatusParamsSchema, toggleUserStatusSchema, updateUserBodySchema, updateUserParamsSchema, updateUserPasswordParamsSchema, updateUserPasswordSchema } from '../validators/user.validator';
import { validateQuery } from '../middleware/validateQuery.middleware';
import { validateTenantLimit } from '../middleware/validateTenantLimits';
import { validateParams } from '../middleware/validateParams.middleware';



const userRouter = express.Router();

userRouter.post("/", validateTenantLimit("user"), validate(createUserSchema), createUser);
userRouter.put("/:id", validateParams(updateUserParamsSchema), validate(updateUserBodySchema), updateUser);
userRouter.patch("/:id/status", validateParams(toggleUserStatusParamsSchema), toggleUserStatus);
userRouter.patch("/:id/password", validateParams(updateUserPasswordParamsSchema), validate(updateUserPasswordSchema), updateUserPassword);
userRouter.get("/simple/:id", getUserByIdSimple);
userRouter.get("/:id", getUserById);
userRouter.get("/by-subsidiary/:subsidiaryId", validateQuery(getAllUsersQuerySchema), getUsersBySubsidiary);

userRouter.post("/:userId/schedules", validate(createScheduleUserSchema), createScheduleUser);
userRouter.get("/:userId/schedules", getSchedulesByUser);
userRouter.get("/schedules/:id", getScheduleUserById);
userRouter.put("/schedules/:id", validate(updateScheduleUserSchema), updateScheduleUser);
userRouter.delete("/schedules/:id", deleteScheduleUser);
userRouter.patch("/schedules/:id/status", toggleScheduleUserStatus);


export default userRouter;