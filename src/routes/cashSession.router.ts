import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { closeCashSession, getCashSessionById, getClosedCashSessionsByUserId, getOpenCashSessionByUserId, openCashSession } from '../controllers/cashSession/cashSession.controller';



const cashSessionRouter = express.Router();


cashSessionRouter.post("/open", openCashSession);
cashSessionRouter.patch("/:id/close", closeCashSession);
cashSessionRouter.get("/:id", getCashSessionById);
cashSessionRouter.get("/byUser/:userId/closed", getClosedCashSessionsByUserId);
cashSessionRouter.get("/byUser/:userId/open", getOpenCashSessionByUserId);

export default cashSessionRouter;