// src/controllers/user.controller.ts
import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcryptjs";
import normalize from "normalize-text";

// ✅ Crear Usuario
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  let {
    username,
    password,
    name,
    lastname,
    ci,
    nit,
    description,
    address,
    cellphone,
    telephone,
    email,
    roleId,
    subsidiaryId,
  } = req.body;

  username = normalize(username.toLowerCase());
  name = normalize(name);
  lastname = normalize(lastname);
  description = normalize(description);
  address = normalize(address);
  email = normalize(email);

  const usernameRegex = /^[a-z0-9.]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      message:
        "Username can only contain lowercase letters, numbers and a dot.",
    });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: subsidiaryId },
    select: { tenantId: true },
  });

  if (!subsidiary) {
    return res.status(404).json({ message: "Subsidiary not found." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
      lastname,
      ci,
      nit,
      description,
      address,
      cellphone,
      telephone,
      email,
      roleId,
      subsidiaryId,
      tenantId: subsidiary.tenantId,
    },
  });

  res.status(201).json(created);
});

// ✅ Obtener Usuario por ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Obtener datos básicos del usuario
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      lastname: true,
      ci: true,
      nit: true,
      address: true,
      cellphone: true,
      telephone: true,
      email: true,
      status: true,
      tenantId: true,
      subsidiary: {
        select: {
          id: true,
          name: true,
        },
      },
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      schedulesUsers: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // 2. Obtener permisos del rol (manual, sin bucles)
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: user.role?.id },
    select: {
      id: true,
      action: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
  });

  // 3. Armar respuesta estructurada
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    lastname: user.lastname,
    ci: user.ci,
    nit: user.nit,
    address: user.address,
    cellphone: user.cellphone,
    telephone: user.telephone,
    email: user.email,
    status: user.status,
    tenantId: user.tenantId,
    subsidiary: user.subsidiary,
    role: {
      id: user.role?.id,
      name: user.role?.name,
      permissions: rolePermissions.map((perm) => ({
        id: perm.id,
        action: perm.action,
        section: perm.section,
      })),
    },
    schedules: user.schedulesUsers,
  });
});

export const getAllUsersByTenantId = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const {
      page = "1",
      limit = "10",
      search = "",
      status = "all",
      orderBy = "name",
      sort = "asc",
    } = req.query;

    const take = Math.min(parseInt(limit as string), 100);
    const skip = (parseInt(page as string) - 1) * take;

    const filters: any = {
      tenantId,
      OR: [
        { name: { contains: search as string, mode: "insensitive" } },
        { username: { contains: search as string, mode: "insensitive" } },
        { ci: { contains: search as string, mode: "insensitive" } },
        { nit: { contains: search as string, mode: "insensitive" } },
      ],
    };

    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        orderBy: { [orderBy as string]: sort },
        skip,
        take,
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  action: true,
                  section: true,
                },
              },
            },
          },
          subsidiary: true,
          schedulesUsers: true,
        },
      }),
      prisma.user.count({ where: filters }),
    ]);

    res.json({ total, page: Number(page), limit: take, data: users });
  }
);

// ✅ Obtener todos los usuarios por Subsidiary (detallado, paginado + búsqueda + filtros)
export const getUsersBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      status = "all",
      orderBy = "name",
      sort = "asc",
    } = req.query;

    const take = Math.min(parseInt(limit as string), 100);
    const skip = (parseInt(page as string) - 1) * take;

    const filters: any = {
      subsidiaryId,
      OR: [
        { name: { contains: search as string, mode: "insensitive" } },
        { username: { contains: search as string, mode: "insensitive" } },
        { ci: { contains: search as string, mode: "insensitive" } },
        { nit: { contains: search as string, mode: "insensitive" } },
      ],
    };

    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        orderBy: { [orderBy as string]: sort },
        skip,
        take,
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  action: true,
                  section: true,
                },
              },
            },
          },
          subsidiary: true,
          schedulesUsers: true,
        },
      }),
      prisma.user.count({ where: filters }),
    ]);

    res.json({ total, page: Number(page), limit: take, data: users });
  }
);

// ✅ Actualizar Usuario (sin permitir cambio de sucursal ni tenant)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  let {
    name,
    lastname,
    ci,
    nit,
    description,
    address,
    cellphone,
    telephone,
    email,
    roleId,
  } = req.body;

  // Normalizar campos
  name = normalize(name);
  lastname = normalize(lastname);
  description = normalize(description);
  address = normalize(address);
  email = normalize(email);

  // Buscar usuario original
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      tenantId: true,
      subsidiaryId: true,
      roleId: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Actualizar datos
  await prisma.user.update({
    where: { id },
    data: {
      name,
      lastname,
      ci,
      nit,
      description,
      address,
      cellphone,
      telephone,
      email,
      roleId,
    },
  });

  // Retornar resumen
  res.json({
    message: "User updated successfully.",
    user: {
      id: user.id,
      username: user.username,
      tenantId: user.tenantId,
      subsidiaryId: user.subsidiaryId,
      roleId,
    },
  });
});

// ✅ Cambiar estado del usuario (activar/desactivar)
export const toggleUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: !user.status },
    });

    res.json({
      message: `User status updated to ${
        updated.status ? "active" : "inactive"
      }.`,
      user: updated,
    });
  }
);

export const updateUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validar longitud del password
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        tenantId: true,
        subsidiaryId: true,
        roleId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Encriptar nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    // Retornar resumen informativo
    res.json({
      message: "Password updated successfully.",
      user: {
        id: user.id,
        username: user.username,
        tenantId: user.tenantId,
        subsidiaryId: user.subsidiaryId,
        roleId: user.roleId,
      },
    });
  }
);
