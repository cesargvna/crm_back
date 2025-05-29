import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { SECRET } from "../utils/config";

// Middleware: Autenticación JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }, // necesario para permisos
    });

    if (!user) return res.status(401).json({ message: "Usuario no válido" });

    req.user = user; // Ahora req.user estará disponible en todo
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware: Validar si es super.admin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role?.name !== "super.admin") {
    return res.status(403).json({ message: "Acceso denegado: solo super.admin" });
  }
  next();
};

// Middleware: Validar permiso específico por módulo + acción
export const hasPermission = (group: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const permission = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        group: { name: group },
        action: { name: action },
      },
    });

    if (!permission) {
      return res.status(403).json({ message: "No tienes permiso para esta acción" });
    }

    next();
  };
};
