import express from "express";
import { login } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authSchema } from "../validators/auth.validator";

const authRouter = express.Router();

authRouter.post("/login", validate(authSchema), login);

export default authRouter;