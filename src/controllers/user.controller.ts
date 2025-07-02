// src/controllers/user.controller.ts
import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcryptjs";
import normalize from "normalize-text";

// ✔️ Name y Lastname: permite ñ, mayús/minús, espacios intermedios (limpios)
export function normalizeNameSpaces(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quita tildes pero deja ñ
    .replace(/[^a-zA-ZñÑ\s]/g, "")     // solo letras y espacios
    .replace(/\s+/g, " ")              // múltiples espacios => uno solo
    .trim();                           // quita espacios extremos
}

// ✔️ Username: solo minúsculas, números, punto; sin espacios
export function normalizeUsername(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9.]/g, "")
    .trim();
}

// ✔️ Email válido
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// ✔️ Teléfono/Celular: +CODE######## formato internacional
export function isValidPhoneNumber(value: string): boolean {
  const phoneRegex = /^\+\d{6,20}$/;
  return phoneRegex.test(value);
}

// ✔️ Para opcionales, sin reglas estrictas
export function optionalNormalize(value?: string) {
  return value ? normalize(value).trim() : undefined;
}

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

  // 🔑 Normalizaciones
  username = normalizeUsername(username);
  name = normalizeNameSpaces(name);
  lastname = normalizeNameSpaces(lastname ?? "");
  ci = optionalNormalize(ci);
  nit = optionalNormalize(nit);
  description = optionalNormalize(description);
  address = optionalNormalize(address);

  // 📧 Email
  if (email) {
    email = email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
  }

  // 📞 Teléfonos
  if (cellphone && !isValidPhoneNumber(cellphone)) {
    return res.status(400).json({ message: "Invalid cellphone format. Use +CODE########" });
  }
  if (telephone && !isValidPhoneNumber(telephone)) {
    return res.status(400).json({ message: "Invalid telephone format. Use +CODE########" });
  }

  // 🔍 Username
  const usernameRegex = /^[a-z0-9.]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      message: "Username can only contain lowercase letters, numbers, and a dot."
    });
  }

  // ✅ Único global
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // ✅ Subsidiary → tenantId
  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: subsidiaryId },
    select: { tenantId: true },
  });
  if (!subsidiary) {
    return res.status(404).json({ message: "Subsidiary not found." });
  }

  // 🔑 Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Crear user
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

  // 🔎 Verifica existencia
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      tenantId: true,
      subsidiaryId: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // 🔑 Normalizaciones coherentes
  name = normalizeNameSpaces(name);
  lastname = normalizeNameSpaces(lastname ?? "");
  ci = optionalNormalize(ci);
  nit = optionalNormalize(nit);
  description = optionalNormalize(description);
  address = optionalNormalize(address);

  if (email) {
    email = email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
  }

  if (cellphone && !isValidPhoneNumber(cellphone)) {
    return res.status(400).json({ message: "Invalid cellphone format. Use +CODE########" });
  }
  if (telephone && !isValidPhoneNumber(telephone)) {
    return res.status(400).json({ message: "Invalid telephone format. Use +CODE########" });
  }

  // ✅ Actualiza permitidos
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

export const getUserByIdSimple = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      lastname: true,
      ci: true,
      nit: true,
      description: true,
      address: true,
      cellphone: true,
      telephone: true,
      email: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    ci: user.ci,
    nit: user.nit,
    description: user.description,
    address: user.address,
    cellphone: user.cellphone,
    telephone: user.telephone,
    email: user.email,
    status: user.status,
    role: {
      id: user.role?.id,
      name: user.role?.name,
      status: user.role?.status,
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1️⃣ Obtener datos básicos del usuario
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      lastname: true,
      ci: true,
      nit: true,
      description: true,
      address: true,
      cellphone: true,
      telephone: true,
      email: true,
      status: true,
      tenantId: true,
      subsidiary: {
        select: { id: true, name: true },
      },
      role: {
        select: { id: true, name: true, status: true },
      },
      schedulesUsers: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // 2️⃣ Obtener permisos del rol: Section -> Module -> Submodule -> Actions
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: user.role?.id },
    include: {
      action: true,
      module: { include: { section: true } },
      submodule: { include: { module: { include: { section: true } } } },
    },
  });

  const hierarchy: Record<string, any> = {};

  for (const rp of rolePermissions) {
    const sectionName = rp.module?.section?.name || rp.submodule?.module?.section?.name || "Unassigned";
    const moduleName = rp.module?.name || rp.submodule?.module?.name || "Unassigned";
    const submoduleName = rp.submodule?.name || null;
    const actionName = rp.action.name;

    if (!hierarchy[sectionName]) {
      hierarchy[sectionName] = {};
    }

    if (!hierarchy[sectionName][moduleName]) {
      hierarchy[sectionName][moduleName] = {};
    }

    if (submoduleName) {
      if (!hierarchy[sectionName][moduleName][submoduleName]) {
        hierarchy[sectionName][moduleName][submoduleName] = [];
      }
      hierarchy[sectionName][moduleName][submoduleName].push({
        id: rp.id,
        action: actionName,
      });
    } else {
      if (!hierarchy[sectionName][moduleName].actions) {
        hierarchy[sectionName][moduleName].actions = [];
      }
      hierarchy[sectionName][moduleName].actions.push({
        id: rp.id,
        action: actionName,
      });
    }
  }

  // 3️⃣ Armar respuesta final
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    lastname: user.lastname,
    description: user.description,
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
      status: user.role?.status,
      permissions: hierarchy,
    },
    schedules: user.schedulesUsers,
  });
});

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
                  module: {
                    select: {
                      name: true,
                      section: { select: { name: true } },
                    },
                  },
                  submodule: {
                    select: {
                      name: true,
                      module: {
                        select: {
                          name: true,
                          section: { select: { name: true } },
                        },
                      },
                    },
                  },
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
