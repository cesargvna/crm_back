export const rolePaths = {
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
                name: { type: "string", example: "Vendedor" },
                description: {
                  type: "string",
                  example: "Acceso limitado a ventas",
                },
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
          description: "Validation or tenant mismatch error",
          content: {
            "application/json": {
              example: {
                message:
                  "The selected subsidiary does not belong to the specified tenant.",
              },
            },
          },
        },
        409: {
          description: "Role already exists",
          content: {
            "application/json": {
              example: {
                message:
                  "A role with the same name already exists in this tenant and subsidiary.",
              },
            },
          },
        },
      },
    },
  },

  "PUT: /roles/{id}": {
    put: {
      tags: ["Role"],
      summary: "Update a role",
      description:
        "Updates the name and/or description of a role. Name must remain unique in the same tenant + subsidiary.",
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
                name: { type: "string", example: "Administrador" },
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
          description: "Name conflict with another role",
          content: {
            "application/json": {
              example: {
                message:
                  "Another role with the same name already exists in this tenant and subsidiary.",
              },
            },
          },
        },
      },
    },
  },

  "PATCH: /roles/{id}/status": {
    patch: {
      tags: ["Role"],
      summary: "Toggle role status",
      description:
        "Enables or disables a role. All users assigned to the role will also be updated.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Role status toggled",
          content: {
            "application/json": {
              example: {
                message: "Role disabled successfully.",
                detail:
                  "All users assigned to this role have also been disabled.",
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

  "GET: /roles/{id}/permissions": {
    get: {
      tags: ["Role"],
      summary: "Get role with permissions",
      description:
        "Returns a role with its assigned permissions including action, section, module and submodule names. Useful for audit or UI role overview.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            example: "c361a874-512f-4f82-a501-7a8c7cd9ec94",
          },
        },
      ],
      responses: {
        200: {
          description: "Role found with enriched permissions",
          content: {
            "application/json": {
              example: {
                id: "c361a874-512f-4f82-a501-7a8c7cd9ec94",
                name: "admin",
                status: true,
                permissions: [
                  {
                    id: "4ad53e6c-2a1e-4f10-8f96-3d4b7fbb9a33",
                    action: "edit",
                    section: "Usuarios",
                    module: "Roles",
                    submodule: "Crear Rol",
                  },
                  {
                    id: "f8be0c45-daa0-43ae-840e-93dca6824109",
                    action: "view",
                    section: "Ventas",
                    module: "Ventas",
                    submodule: null,
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

  "GET: /roles/{id}": {
    get: {
      tags: ["Role"],
      summary: "Get role with full info",
      description:
        "Returns role with related users, tenant, subsidiary and assigned permissions.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Role found with extended info",
          content: {
            "application/json": {
              example: {
                role: {
                  id: "uuid",
                  name: "superadmin",
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
                users: [
                  {
                    id: "uuid",
                    name: "Luis",
                    email: "luis@empresa.com",
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

  "GET: /roles/by-subsidiary/{subsidiaryId}": {
    get: {
      tags: ["Role"],
      summary: "Get all roles by subsidiary",
      description:
        "Returns all roles of a subsidiary, including users and permissions. Includes optional filters and pagination.",
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
        },
        { name: "search", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["true", "false", "all"],
            default: "all",
          },
        },
        {
          name: "orderBy",
          in: "query",
          schema: {
            type: "string",
            enum: ["name", "created_at", "updated_at"],
          },
        },
        {
          name: "sort",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
        },
      ],
      responses: {
        200: {
          description: "Roles by subsidiary returned",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 10,
                tenant: {
                  id: "uuid",
                  name: "PERU - LIBRERÍA",
                },
                data: [
                  {
                    id: "uuid",
                    name: "vendedor",
                    users: [
                      {
                        id: "uuid",
                        name: "Tatiana",
                        status: true,
                        permissions: [
                          {
                            section: { name: "Ventas" },
                            action: { name: "crear" },
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

  "GET: /roles/by-tenant/{tenantId}": {
    get: {
      tags: ["Role"],
      summary: "Get all roles by tenant",
      description:
        "Returns all roles grouped by subsidiary with assigned permissions. Useful for visualization and audit.",
      parameters: [
        {
          name: "tenantId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Roles grouped by subsidiaries",
          content: {
            "application/json": {
              example: {
                tenant: {
                  id: "uuid",
                  name: "PERU - LIBRERÍA",
                  description: "Empresa peruana",
                },
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
};
