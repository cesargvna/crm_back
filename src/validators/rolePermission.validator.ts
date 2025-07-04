import { z } from "zod";

// Crear asignación de permiso a un rol
export const createRolePermissionSchema = z.object({
  actionId: z.string().uuid({ message: "Invalid action ID" }),
  tenantId: z.string().uuid({ message: "Invalid tenant ID" }),
  subsidiaryId: z.string().uuid({ message: "Invalid subsidiary ID" }),
  moduleId: z.string().uuid().nullable().optional(),
  submoduleId: z.string().uuid().nullable().optional(),
});

// Query para filtrar
export const getRolePermissionsQuerySchema = z.object({
  tenantId: z.string().uuid().optional(),
  subsidiaryId: z.string().uuid().optional(),
});
