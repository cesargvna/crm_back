export const rolePermissionPaths = {
  "POST: role/rolePermission": {
    post: {
      tags: ["Role Permission"],
      summary: "Assign a permission to a role",
      description:
        "Creates a new permission assignment for a role. Prevents duplicate assignments. The tenant and subsidiary are inferred from the role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["roleId", "actionId", "sectionId"],
              properties: {
                roleId: { type: "string", format: "uuid", example: "rol-123" },
                actionId: { type: "string", format: "uuid", example: "act-1" },
                sectionId: { type: "string", format: "uuid", example: "sec-1" },
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
              example: {
                id: "perm-001",
                roleId: "rol-123",
                actionId: "act-1",
                sectionId: "sec-1",
                moduleId: "mod-1",
                submoduleId: "subm-2",
                tenantId: "tenant-789",
                subsidiaryId: "sub-456",
                compositeKey: "rol-123-act-1-sec-1-mod-1-subm-2",
              },
            },
          },
        },
        404: {
          description: "Role not found",
          content: {
            "application/json": {
              example: { message: "Role not found." },
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

  "GET: role/rolePermission/{roleId}": {
    get: {
      tags: ["Role Permission"],
      summary: "Get all permissions assigned to a role",
      description:
        "Returns all permissions assigned to a role, including action, section, module, submodule and related tenant/subsidiary.",
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
              example: {
                role: {
                  id: "rol-123",
                  name: "Administrador",
                  description: "Rol con acceso total al sistema",
                },
                subsidiary: {
                  id: "sub-456",
                  name: "Sucursal Central",
                },
                tenant: {
                  id: "tenant-789",
                  name: "PERU - LIBRERÍA",
                  description: "Empresa peruana especializada en libros",
                },
                permissions: [
                  {
                    id: "perm-001",
                    action: {
                      id: "act-1",
                      name: "ver",
                    },
                    section: {
                      id: "sec-1",
                      name: "Usuarios",
                    },
                    moduleId: "mod-1",
                    submoduleId: "subm-2",
                    compositeKey: "rol-123-act-1-sec-1-mod-1-subm-2",
                  },
                ],
              },
            },
          },
        },
        404: {
          description: "Role not found",
          content: {
            "application/json": {
              example: { message: "Role not found." },
            },
          },
        },
      },
    },
  },

  "GET: role/rolePermission/by-tenant/{tenantId}": {
    get: {
      tags: ["Role Permission"],
      summary: "Get all role permissions by tenant ID",
      description:
        "Returns all role-permission assignments for the specified tenant, including action, section, role, module, submodule and compositeKey.",
      parameters: [
        {
          name: "tenantId",
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
              example: {
                tenantId: "tenant-789",
                total: 12,
                permissions: [
                  {
                    id: "perm-001",
                    action: {
                      id: "act-1",
                      name: "ver",
                    },
                    section: {
                      id: "sec-1",
                      name: "Inventario",
                    },
                    moduleId: "mod-1",
                    submoduleId: "subm-2",
                    compositeKey: "rol-123-act-1-sec-1-mod-1-subm-2",
                    role: {
                      id: "rol-123",
                      name: "Vendedor",
                      description: "Rol limitado",
                    },
                    subsidiaryId: "sub-456",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: role/rolePermission/by-subsidiary/{subsidiaryId}": {
    get: {
      tags: ["Role Permission"],
      summary: "Get all role permissions by subsidiary ID",
      description:
        "Returns all role-permission assignments for the specified subsidiary, including role, action, section and compositeKey.",
      parameters: [
        {
          name: "subsidiaryId",
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
              example: {
                subsidiaryId: "sub-456",
                total: 6,
                permissions: [
                  {
                    id: "perm-002",
                    action: {
                      id: "act-2",
                      name: "editar",
                    },
                    section: {
                      id: "sec-2",
                      name: "Ventas",
                    },
                    moduleId: "mod-2",
                    submoduleId: "subm-3",
                    compositeKey: "rol-124-act-2-sec-2-mod-2-subm-3",
                    role: {
                      id: "rol-124",
                      name: "Cajero",
                      description: "Rol con acceso a caja",
                    },
                    tenantId: "tenant-789",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

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
              example: {
                message: "Permission removed from role successfully.",
                deleted: {
                  id: "perm-001",
                  role: {
                    id: "rol-123",
                    name: "Administrador",
                  },
                  action: {
                    id: "act-1",
                    name: "ver",
                  },
                  section: {
                    id: "sec-1",
                    name: "Usuarios",
                  },
                  moduleId: "mod-1",
                  submoduleId: "subm-2",
                  tenantId: "tenant-789",
                  subsidiaryId: "sub-456",
                  compositeKey: "rol-123-act-1-sec-1-mod-1-subm-2",
                },
              },
            },
          },
        },
        404: {
          description: "RolePermission not found",
          content: {
            "application/json": {
              example: { message: "RolePermission not found." },
            },
          },
        },
      },
    },
  },
};
