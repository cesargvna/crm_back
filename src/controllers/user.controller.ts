import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../utils/prisma";
import * as bcrypt from "bcryptjs";

// Crear usuario
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, username, subsidiaryId, ...otherData } = req.body;

    if (!password) {
      res.status(400).json({ success: false, message: "Password is required" });
      return;
    }

    const normalizedUsername = username.normalize("NFD").replace(/[̀-ͯ]/g, "");

    // ✅ Comparar username ignorando mayúsculas/minúsculas y acentos
    const exists = await prisma.user.findFirst({
      where: {
        username: { equals: normalizedUsername, mode: "insensitive" },
        subsidiaryId,
      },
    });

    if (exists) {
      res.status(400).json({
        success: false,
        message: "Username already exists in this subsidiary",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        subsidiaryId,
        tenantId: req.user?.tenantId,
        password: hashedPassword,
        ...otherData,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "User created", data: newUser });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { password, username, subsidiaryId, ...otherData } = req.body;

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.user?.tenantId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // ✅ Validar duplicado ignorando case y acentos en actualización
    if (username && subsidiaryId) {
      const normalizedUsername = username.normalize("NFD").replace(/[̀-ͯ]/g, "");

      const duplicate = await prisma.user.findFirst({
        where: {
          id: { not: id },
          username: { equals: normalizedUsername, mode: "insensitive" },
          subsidiaryId,
        },
      });

      if (duplicate) {
        res.status(400).json({
          success: false,
          message: "Username already exists in this subsidiary",
        });
        return;
      }
    }

    const updatedData: any = {
      username,
      subsidiaryId,
      ...otherData,
    };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    res
      .status(200)
      .json({ success: true, message: "User updated", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search = "",
      page = "1",
      limit = "10",
      sortBy = "name",
      sortOrder = "asc",
      status = "all",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string), 1), 1000);
    const skip = (pageNumber - 1) * pageSize;

    const searchTerm = (search as string)
      .trim()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

    const where: any = {
      tenantId: req.user?.tenantId,
      ...(status !== "all" && { status: status === "true" }),
      ...(searchTerm.length >= 3 && {
        OR: [
          { username: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true, subsidiary: true },
        skip,
        take: pageSize,
        orderBy: { [sortBy as string]: sortOrder === "desc" ? "desc" : "asc" },
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
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.user?.tenantId },
      include: {
        schedulesUsers: true,
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

// Cambiar estado (habilitar/deshabilitar)
export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.user?.tenantId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: !user.status },
    });

    const { password, ...safeUser } = updated;

    res
      .status(200)
      .json({ success: true, message: "User status updated", data: safeUser });
  } catch (error) {
    next(error);
  }
};
