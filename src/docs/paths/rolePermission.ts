export const rolePermissionPaths = {
  "POST: role/roles/{roleId}/permissions": {
    post: {
      tags: ["Role Permission"],
      summary: "Assign a permission to a role",
      description:
        "Creates a new permission assignment for a role using its ID from the URL. Prevents duplicate assignments with a composite key.",
      parameters: [
        {
          name: "roleId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid", example: "rol-123" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["actionId", "tenantId", "subsidiaryId"],
              properties: {
                actionId: { type: "string", format: "uuid", example: "act-1" },
                moduleId: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                  example: "mod-1",
                },
                submoduleId: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                  example: "subm-2",
                },
                tenantId: {
                  type: "string",
                  format: "uuid",
                  example: "tenant-789",
                },
                subsidiaryId: {
                  type: "string",
                  format: "uuid",
                  example: "sub-456",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Permission assigned successfully",
          content: {
            "application/json": {
              example: {
                id: "perm-001",
                roleId: "rol-123",
                actionId: "act-1",
                moduleId: "mod-1",
                submoduleId: "subm-2",
                tenantId: "tenant-789",
                subsidiaryId: "sub-456",
                compositeKey: "rol-123_act-1_mod-1_subm-2",
                created_at: "2025-06-30T12:00:00Z",
              },
            },
          },
        },
        409: {
          description: "Permission already assigned",
          content: {
            "application/json": {
              example: {
                message: "This permission is already assigned to the role.",
              },
            },
          },
        },
      },
    },
  },

  "GET: role/roles/{roleId}/permissions-list": {
    get: {
      tags: ["Role Permission"],
      summary: "Get role permissions (hierarchical, sidebar style)",
      description:
        "Returns the role with its assigned permissions in a structured sidebar format: Section → Module → Submodule → Actions. Each action includes its RolePermission ID for traceability.",
      parameters: [
        {
          name: "roleId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "40cad9a9-4bec-4efc-b027-2504ad3f8ea5",
        },
      ],
      responses: {
        200: {
          description: "Role with hierarchical permissions",
          content: {
            "application/json": {
              example: {
                roleId: "40cad9a9-4bec-4efc-b027-2504ad3f8ea5",
                roleName: "Super.Admin",
                roleStatus: true,
                permissions: {
                  Ventas: {
                    Caja: {
                      actions: [
                        { id: "perm-123", action: "ver" },
                        { id: "perm-124", action: "crear" },
                      ],
                    },
                    Ventas: {
                      actions: [{ id: "perm-125", action: "ver" }],
                      Cotizaciones: [{ id: "perm-126", action: "ver" }],
                    },
                  },
                  Almacen: {
                    Productos: {
                      actions: [
                        { id: "perm-200", action: "ver" },
                        { id: "perm-201", action: "crear" },
                      ],
                    },
                    Inventario: {
                      actions: [{ id: "perm-202", action: "ver" }],
                    },
                  },
                  Reportes: {
                    Ventas: {
                      "Cierres de Caja": [
                        { id: "perm-300", action: "ver" },
                        { id: "perm-301", action: "exportar" },
                      ],
                    },
                    Clientes: {
                      "Actividad de Clientes": [
                        { id: "perm-400", action: "ver" },
                        { id: "perm-401", action: "exportar" },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Role not found",
          content: {
            "application/json": {
              example: {
                message: "Role not found",
              },
            },
          },
        },
      },
    },
  },

  "DELETE: role/role-permission/{id}": {
    delete: {
      tags: ["Role Permission"],
      summary: "Delete a permission assignment",
      description:
        "Deletes an existing permission assignment by its unique ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Permission deleted successfully",
          content: {
            "application/json": {
              example: {
                message: "Permission assignment deleted successfully.",
              },
            },
          },
        },
        404: {
          description: "Permission not found",
          content: {
            "application/json": {
              example: { message: "Role permission not found." },
            },
          },
        },
      },
    },
  },
};
