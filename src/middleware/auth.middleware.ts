import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils/config";
import { asyncHandler } from "../utils/asyncHandler";

// Global typing
declare global {
  namespace Express {
    interface User {
      id: string;
      roleId: string;
      tenantId: string;
      username: string;
    }

    interface Request {
      user?: User;
    }
  }
}

// ✅ Authentication middleware without DB access
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET) as Express.User;

    if (!decoded || !decoded.id || !decoded.username || !decoded.roleId) {
      return res.status(401).json({ message: "Invalid or incomplete token." });
    }

    // ✅ Permitir que tenantId sea null SOLO si es System.admin (case-insensitive)
    const isSystemAdmin = decoded.roleId?.toLowerCase() === "system.admin";

    if (!isSystemAdmin && !decoded.tenantId) {
      return res
        .status(401)
        .json({ message: "Tenant ID is required for this user." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});
