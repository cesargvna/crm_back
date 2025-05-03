import express from 'express';
const authRouter = express.Router();
import { login } from '../controllers/auth.controller';
import { authSchema } from '../validators/auth.validator';
import { validate } from '../middleware/validate.middleware';

authRouter.post('/',validate(authSchema), login);

export default authRouter;
