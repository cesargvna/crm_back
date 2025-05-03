import express from 'express';
const userRouter = express.Router();
import { createUser, updateUser, getAllUsers,getUserById } from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { userSchema } from '../validators/user.validator';


userRouter.post('/',validate(userSchema), createUser);
userRouter.put('/:id',validate(userSchema), updateUser);
userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);

export default userRouter;