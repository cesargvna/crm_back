import { z } from "zod";

// ✅ UUID opcional que transforma "", null o undefined → null
const optionalUUID = z
  .union([z.string().uuid(), z.literal(""), z.null(), z.undefined()])
  .transform((val) => {
    if (val === "" || val === null || val === undefined) return null;
    return val;
  });

// ✅ Validación para crear un permiso de rol
export const createRolePermissionSchema = z.object({
  roleId: z.string().uuid({ message: "Invalid roleId" }),
  actionId: z.string().uuid({ message: "Invalid actionId" }),
  sectionId: z.string().uuid({ message: "Invalid sectionId" }),
  moduleId: optionalUUID,
  submoduleId: optionalUUID,
});

// ✅ Validación de parámetro para obtener permisos por rol
export const getRolePermissionParamsSchema = z.object({
  roleId: z.string().uuid({ message: "Invalid roleId" }),
});

// ✅ Validación de parámetro para eliminar un permiso
export const deleteRolePermissionParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid role permission ID" }),
});
