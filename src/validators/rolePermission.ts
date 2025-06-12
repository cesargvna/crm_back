import { z } from "zod";

const optionalUUID = z
  .union([
    z.string().uuid(),
    z.literal(""),
    z.null()
  ])
  .transform((val) => (val === "" ? null : val));

export const createRolePermissionSchema = z.object({
  roleId: z.string().uuid({ message: "Invalid roleId" }),
  actionId: z.string().uuid({ message: "Invalid actionId" }),
  sectionId: z.string().uuid({ message: "Invalid sectionId" }),
  moduleId: optionalUUID.optional(),
  submoduleId: optionalUUID.optional(),
});

export const getRolePermissionParamsSchema = z.object({
  roleId: z.string().uuid({ message: "Invalid roleId" }),
});

export const deleteRolePermissionParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid role permission ID" }),
});