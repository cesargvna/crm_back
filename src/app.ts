import express from 'express';
const app = express();
import cors from 'cors';
import errorHandler from './middleware/global.middleware';
import subsidiaryRouter from "./routes/subsidiary.router";
import rolePermissionRouter from './routes/role_permission.router';
import userRouter from './routes/user.router';
import authRouter from './routes/auth.router';



app.use(express.json());
app.use(cors());

app.use('/login', authRouter);
app.use('/subsidiary', subsidiaryRouter);
app.use('/role', rolePermissionRouter);
app.use('/user', userRouter);

app.use(errorHandler);

export default app;