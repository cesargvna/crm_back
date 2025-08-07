export const rolePaths = {
  // 🚩 Crear rol
  "POST: /roles": {
    post: {
      tags: ["Role"],
      summary: "Create a new role",
      description:
        "Creates a new role associated with a tenant and a subsidiary. Name must be unique per tenant + subsidiary and follow naming rules.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "vendedor" },
                description: { type: "string", example: "Acceso limitado a ventas" },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Role created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "vendedor",
                description: "Acceso limitado a ventas",
                tenantId: "uuid",
                subsidiaryId: "uuid",
                status: true,
                createdAt: "2025-06-15T12:00:00Z",
                updatedAt: "2025-06-15T12:00:00Z",
              },
            },
          },
        },
        400: {
          description: "Validation error or tenant mismatch",
          content: {
            "application/json": {
              example: {
                message: "The selected subsidiary does not belong to the specified tenant.",
              },
            },
          },
        },
        409: {
          description: "Role name conflict",
          content: {
            "application/json": {
              example: {
                message:
                  "A role with the name \"vendedor\" already exists in this tenant and subsidiary.",
              },
            },
          },
        },
      },
    },
  },

  // 🚩 Actualizar rol
  "PUT: /roles/{id}": {
    put: {
      tags: ["Role"],
      summary: "Update a role",
      description:
        "Updates the name and/or description of a role. Name must remain unique per tenant + subsidiary.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "administrador" },
                description: { type: "string", example: "Permisos completos" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Role updated",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "administrador",
                description: "Permisos completos",
                tenantId: "uuid",
                subsidiaryId: "uuid",
                status: true,
                updatedAt: "2025-06-15T13:45:00Z",
              },
            },
          },
        },
        404: {
          description: "Role not found",
          content: {
            "application/json": {
              example: { message: "Role not found" },
            },
          },
        },
        409: {
          description: "Name conflict",
          content: {
            "application/json": {
              example: {
                message:
                  "Another role with the name \"administrador\" already exists in this tenant and subsidiary.",
              },
            },
          },
        },
      },
    },
  },

  // 🚩 Toggle status
  "PATCH: /roles/{id}/status": {
    patch: {
      tags: ["Role"],
      summary: "Toggle role status",
      description:
        "Enables or disables a role. Also updates all users assigned to that role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Role status toggled",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "vendedor",
                newStatus: false,
                message: "Role disabled successfully.",
                detail: "All users assigned to the role \"vendedor\" have also been disabled.",
              },
            },
          },
        },
        404: {
          description: "Role not found",
          content: {
            "application/json": {
              example: { message: "Role not found" },
            },
          },
        },
      },
    },
  },

  // 🚩 Get role with permissions hierarchy
  "GET: /roles/{id}/permissions": {
    get: {
      tags: ["Role"],
      summary: "Get role with hierarchical permissions",
      description:
        "Returns the role with its permissions structured by section → module → submodule → actions.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Role with hierarchical permissions",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "vendedor",
                status: true,
                permissions: {
                  Ventas: {
                    Productos: {
                      actions: ["view", "create"],
                    },
                    "Gestión Ventas": {
                      "Notas de Crédito": ["create", "delete"],
                    },
                  },
                  Usuarios: {
                    Roles: {
                      actions: ["view"],
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
              example: { message: "Role not found" },
            },
          },
        },
      },
    },
  },

  // 🚩 Obtener rol extendido por ID
  "GET: /roles/{id}": {
    get: {
      tags: ["Role"],
      summary: "Get role with full details",
      description:
        "Returns the role with related users, tenant, subsidiary and flat permissions.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Role with details",
          content: {
            "application/json": {
              example: {
                role: {
                  id: "uuid",
                  name: "superadmin",
                  description: "Rol principal",
                  status: true,
                },
                tenant: {
                  id: "uuid",
                  name: "PERU - LIBRERÍA",
                },
                subsidiary: {
                  id: "uuid",
                  name: "Sucursal Central",
                },
                permissions: [
                  {
                    id: "uuid",
                    action: "edit",
                    module: "Usuarios",
                    submodule: "Editar Usuario",
                    section: "Usuarios",
                  },
                ],
                users: [
                  {
                    id: "uuid",
                    name: "Tatiana",
                    email: "tatiana@libreria.com",
                    status: true,
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
              example: { message: "Role not found" },
            },
          },
        },
      },
    },
  },

  // 🚩 Roles por Subsidiary (completo)
  "GET: /rolesBySubsidiaryComplete/{subsidiaryId}": {
    get: {
      tags: ["Role"],
      summary: "Get roles by subsidiary (full)",
      description:
        "Returns all roles in a subsidiary with users and permissions. Supports filters, search, sort, pagination.",
      parameters: [
        { name: "subsidiaryId", in: "path", required: true, schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "search", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["true", "false", "all"], default: "all" },
        },
        {
          name: "orderBy",
          in: "query",
          schema: { type: "string", enum: ["name", "created_at", "updated_at"] },
        },
        { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
      ],
      responses: {
        200: {
          description: "Roles returned",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 10,
                tenant: { id: "uuid", name: "PERU - LIBRERÍA" },
                data: [
                  {
                    id: "uuid",
                    name: "vendedor",
                    users: [
                      {
                        id: "uuid",
                        name: "Luis",
                        status: true,
                        permissions: [
                          {
                            section: "Ventas",
                            module: "Productos",
                            submodule: null,
                            action: "create",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  // 🚩 Roles por Tenant
  "GET: /rolesByTenant/{tenantId}": {
    get: {
      tags: ["Role"],
      summary: "Get roles grouped by subsidiaries (tenant)",
      description: "Returns roles grouped by subsidiary for a tenant, including permissions.",
      parameters: [
        { name: "tenantId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Roles grouped",
          content: {
            "application/json": {
              example: {
                tenant: { id: "uuid", name: "PERU - LIBRERÍA", description: "Empresa peruana" },
                subsidiaries: [
                  {
                    name: "Sucursal Central",
                    roles: [
                      {
                        name: "admin",
                        status: true,
                        permissions: [
                          {
                            action: "edit",
                            section: "Usuarios",
                            module: "Roles",
                            submodule: "Crear Rol",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
        404: {
          description: "Tenant not found",
          content: {
            "application/json": {
              example: { message: "Tenant not found" },
            },
          },
        },
      },
    },
  },

  // 🚩 Roles activos básicos por Subsidiary
  "GET: /rolesBySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Role"],
      summary: "Get active roles by subsidiary (simple)",
      description: "Returns only id and name for active roles of a subsidiary.",
      parameters: [
        { name: "subsidiaryId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "List of active roles",
          content: {
            "application/json": {
              example: [
                { id: "uuid", name: "vendedor" },
                { id: "uuid", name: "admin" },
              ],
            },
          },
        },
      },
    },
  },
};
