import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";
//import bcrypt from "bcrypt";
import * as bcrypt from 'bcryptjs';

// Crear usuario
export const createUser = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const {password, ...otherData } = req.body;
    if (!password) {
      res.status(400).json({ success: false, message: "Password is required" });
      return;
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        password:hashedPassword, 
        ...otherData,
      },
    });

    res.status(201).json({ success: true, message: "User created", data: newUser });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {password, ...otherData } = req.body;
    const saltRounds = 10;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    let updatedData: any = { ...otherData };

    if (password) {
      updatedData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    res.status(200).json({ success: true, message: "User updated", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// Obtener usuario por ID
export const getUserById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return ;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
