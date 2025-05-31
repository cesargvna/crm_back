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
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search = '',
      page = '1',
      limit = '10',
      sortBy = 'name',
      sortOrder = 'asc',
      status = 'all',
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string).trim();

    const where: any = {
      ...(status !== 'all' && { status: status === 'true' }),
      ...(searchTerm.length >= 3 && {
        OR: [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { name: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true, subsidiary: true },
        skip,
        take: pageSize,
        orderBy: { [sortBy as string]: sortOrder === 'desc' ? 'desc' : 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    const sanitizedUsers = users.map(({ password, ...rest }) => rest);

    res.status(200).json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};


// Obtener usuario por ID con horarios incluidos
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        schedulesUsers: true, // Incluye los horarios del usuario
        role: true,
        subsidiary: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { password, ...safeUser } = user;

    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
};


export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: !user.status }
    });

    const { password, ...safeUser } = updated;
    res.status(200).json({ success: true, message: "User status updated", data: safeUser });
  } catch (error) {
    next(error);
  }
};