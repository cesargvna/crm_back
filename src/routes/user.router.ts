import express from 'express';
import { validate } from '../middleware/validate.middleware';

import { createScheduleUserSchema,  updateScheduleUserSchema } from '../validators/scheduleUser.validator';
import { createScheduleUser, deleteScheduleUser, getSchedulesByUser, getScheduleUserById, toggleScheduleUserStatus, updateScheduleUser } from '../controllers/scheduleUser.controller';
import { createUser, getUserById, getUserByIdSimple, getUsersBySubsidiary, toggleUserStatus, updateUser, updateUserPassword } from '../controllers/user.controller';
import { createUserSchema, getAllUsersQuerySchema, toggleUserStatusSchema, updateUserPasswordSchema, updateUserSchema } from '../validators/user.validator';
import { validateQuery } from '../middleware/validateQuery.middleware';
import { validateTenantLimit } from '../middleware/validateTenantLimits';



const userRouter = express.Router();

userRouter.post("/", validateTenantLimit("user"), validate(createUserSchema), createUser);
userRouter.put("/:id", validate(updateUserSchema), updateUser);
userRouter.patch("/:id/status", validate(toggleUserStatusSchema), toggleUserStatus);
userRouter.patch("/:id/password", validate(updateUserPasswordSchema), updateUserPassword);
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