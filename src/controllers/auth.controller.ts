import { Request, Response } from "express";
import prisma from "../utils/prisma";
import * as bcrypt from "bcryptjs";
import { tokenSign } from "../utils/handleToken";
import { asyncHandler } from "../utils/asyncHandler";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // ✅ Normalizar para ignorar acentos y mayúsculas/minúsculas
  const normalizedUsername = username
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: normalizedUsername,
        mode: "insensitive"
      }
    },
    include: { role: true },
  });

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = await tokenSign({
    id: user.id,
    username: user.username,
    tenantId: user.tenantId,
    roleId: user.roleId,
  });

  const { password: _, ...safeUser } = user;

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: safeUser,
  });
});
