//import bcrypt from 'bcrypt';
import * as bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { getTokenExpireTime, tokenSign } from '../utils/handleToken';

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: {username} });
        const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.password);

        if(!(user && passwordCorrect)){
            res.status(401).json({error: 'Invalid username or password'});
        }

        const token = await tokenSign(user);
        const expire = getTokenExpireTime();
        res.status(200).json({token,expire});

    } catch (error) {
        next(error);
    }
};

export { login };