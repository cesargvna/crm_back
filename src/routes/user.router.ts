import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { getAllUsersQuerySchema, updateUserPasswordSchema, userSchema } from '../validators/user.validator';
import { createUser, getAllUsersByTenantId, getUserById, getUserByIdSimple, getUsersBySubsidiary, toggleUserStatus, updateUser, updateUserPassword } from '../controllers/user.controller';
import { createScheduleUserSchema,  updateScheduleUserSchema } from '../validators/scheduleUser.validator';
import { createScheduleUser, deleteScheduleUser, getSchedulesByUser, toggleScheduleUserStatus, updateScheduleUser } from '../controllers/scheduleUser.controller';



const userRouter = express.Router();

userRouter.post("/", validate(userSchema), createUser);
userRouter.get("/:id", getUserById);
userRouter.get("/simple/:id", getUserByIdSimple);
userRouter.get("/by-tenant/:tenantId", validate(getAllUsersQuerySchema), getAllUsersByTenantId);
userRouter.get("/by-subsidiary/:subsidiaryId", validate(getAllUsersQuerySchema), getUsersBySubsidiary);
userRouter.put("/:id", validate(userSchema.omit( {username: true,password: true,subsidiaryId: true} )), updateUser);
userRouter.patch("/:id/status", toggleUserStatus);
userRouter.patch("/:id/password", validate(updateUserPasswordSchema), updateUserPassword);

userRouter.post("/:userId/schedules", validate(createScheduleUserSchema), createScheduleUser);
userRouter.get("/:userId/schedules", getSchedulesByUser);
userRouter.put("/schedules/:id", validate(updateScheduleUserSchema), updateScheduleUser);
userRouter.delete("/schedules/:id", deleteScheduleUser);
userRouter.patch("/schedules/:id/status", toggleScheduleUserStatus);


export default userRouter;