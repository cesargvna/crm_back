import express from 'express';
const authRouter = express.Router();
import { login } from '../controllers/auth/auth.controller';
import { authSchema } from '../validators/auth/auth.validator';
import { validate } from '../middleware/validate.middleware';

authRouter.post('/',validate(authSchema), login);

export default authRouter;
