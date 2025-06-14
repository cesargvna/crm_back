export const rolePermissionPaths = {
  // ✅ Crear una nueva asignación de permiso
  "POST: role/rolePermission": {
    post: {
      tags: ["Role Permission"],
      summary: "Assign a permission to a role",
      description:
        "Creates a new permission assignment for a role. Prevents duplicate assignments. The tenant is inferred from the role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["roleId", "actionId", "sectionId"],
              properties: {
                roleId: {
                  type: "string",
                  format: "uuid",
                  example: "rol-123",
                },
                actionId: {
                  type: "string",
                  format: "uuid",
                  example: "act-1",
                },
                sectionId: {
                  type: "string",
                  format: "uuid",
                  example: "sec-1",
                },
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
              schema: {
                type: "object",
                properties: {
                  id: { type: "string", example: "perm-001" },
                  roleId: { type: "string", example: "rol-123" },
                  actionId: { type: "string", example: "act-1" },
                  sectionId: { type: "string", example: "sec-1" },
                  moduleId: { type: "string", example: "mod-1" },
                  submoduleId: { type: "string", example: "subm-2" },
                  tenantId: { type: "string", example: "tenant-789" },
                },
              },
            },
          },
        },
        404: {
          description: "Role not found",
        },
        409: {
          description:
            "Permission already assigned to this role (duplicate entry)",
        },
      },
    },
  },

  // ✅ Obtener permisos por ID de rol
  "GET: role/rolePermission/{roleId}": {
    get: {
      tags: ["Role Permission"],
      summary: "Get all permissions assigned to a role",
      description:
        "Returns all permissions assigned to a role, including tenant and subsidiary information.",
      parameters: [
        {
          name: "roleId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Permissions retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "rol-123" },
                      name: { type: "string", example: "Administrador" },
                      description: {
                        type: "string",
                        example: "Rol con acceso total al sistema",
                      },
                    },
                  },
                  subsidiary: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "sub-456" },
                      name: { type: "string", example: "Sucursal Central" },
                    },
                  },
                  tenant: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "tenant-789" },
                      name: { type: "string", example: "PERU - LIBRERÍA" },
                      description: {
                        type: "string",
                        example: "Empresa peruana especializada en libros",
                      },
                    },
                  },
                  permissions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "perm-001" },
                        action: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "act-1" },
                            name: { type: "string", example: "ver" },
                          },
                        },
                        section: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "sec-1" },
                            name: { type: "string", example: "Usuarios" },
                          },
                        },
                        moduleId: {
                          type: "string",
                          nullable: true,
                          example: "mod-1",
                        },
                        submoduleId: {
                          type: "string",
                          nullable: true,
                          example: "subm-2",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Role not found",
        },
      },
    },
  },

  // ✅ Eliminar permiso por ID
  "DELETE: role/rolePermission/{id}": {
    delete: {
      tags: ["Role Permission"],
      summary: "Remove a permission from a role",
      description:
        "Deletes a permission assignment from a role using its unique ID.",
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
          description: "Permission removed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Permission removed from role successfully.",
                  },
                  deleted: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "perm-001" },
                      roleId: { type: "string", example: "rol-123" },
                      actionId: { type: "string", example: "act-1" },
                      sectionId: { type: "string", example: "sec-1" },
                      moduleId: { type: "string", example: "mod-1" },
                      submoduleId: { type: "string", example: "subm-2" },
                      tenantId: { type: "string", example: "tenant-789" },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "RolePermission not found",
        },
      },
    },
  },
};
