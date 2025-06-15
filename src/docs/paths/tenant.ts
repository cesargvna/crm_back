export const tenantPaths = {
  "POST: /tenant": {
    post: {
      tags: ["Tenant"],
      summary: "Create a new tenant",
      description:
        "Creates a new tenant. The name must be unique and normalized (no tildes, no espacios, no símbolos).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: {
                  type: "string",
                  example: "PERU - LIBRERÍA",
                },
                description: {
                  type: "string",
                  example: "Empresa peruana especializada en libros escolares.",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Tenant created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid-1",
                name: "PERU - LIBRERIA",
                description:
                  "Empresa peruana especializada en libros escolares.",
                status: true,
                created_at: "2025-06-15T10:00:00.000Z",
                updated_at: "2025-06-15T10:00:00.000Z",
              },
            },
          },
        },
        400: { description: "Validation error" },
        409: { description: "Tenant already exists" },
      },
    },
  },

  "PUT: /tenant/{id}": {
    put: {
      tags: ["Tenant"],
      summary: "Update tenant",
      description:
        "Updates the name and description of a tenant. Name must remain unique.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: {
                  type: "string",
                  example: "BOLIVIA - MATERIAL DE OFICINA",
                },
                description: {
                  type: "string",
                  example: "Distribuidora de útiles de oficina y escolares.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Tenant updated successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid-2",
                name: "BOLIVIA - MATERIAL DE OFICINA",
                description: "Distribuidora de útiles de oficina y escolares.",
                status: true,
                created_at: "2025-06-10T08:00:00.000Z",
                updated_at: "2025-06-15T12:00:00.000Z",
              },
            },
          },
        },
        400: { description: "Validation error" },
        409: { description: "Tenant name already exists" },
      },
    },
  },

  "PATCH: /tenant/{id}/status": {
    patch: {
      tags: ["Tenant"],
      summary: "Toggle tenant status",
      description:
        "Toggles the tenant `status` (active/inactive). This also updates all related users, roles, and subsidiaries to the same status.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description:
            "Tenant status updated and related entities updated accordingly",
          content: {
            "application/json": {
              example: {
                message: "Tenant status updated to inactive",
                updated: {
                  tenantStatus: false,
                  affectedEntities: {
                    users: "All users under tenant set to false",
                    subsidiaries: "All subsidiaries under tenant set to false",
                    roles: "All roles under tenant set to false",
                  },
                },
                tenant: {
                  id: "uuid-1",
                  name: "PERU - LIBRERIA",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Tenant not found" },
      },
    },
  },

  "DELETE: /tenant/{id}": {
    delete: {
      tags: ["Tenant"],
      summary: "Delete tenant and all related data",
      description:
        "Deletes the tenant and all related users, roles, and subsidiaries. Includes a count of deleted records.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Tenant and related data deleted successfully",
          content: {
            "application/json": {
              example: {
                message:
                  'Tenant "TENANT TEMPORAL" and related data deleted successfully.',
                deletedRelations: {
                  users: 8,
                  roles: 2,
                  subsidiaries: 1,
                },
              },
            },
          },
        },
        404: { description: "Tenant not found" },
      },
    },
  },

  "GET: /tenant": {
    get: {
      tags: ["Tenant"],
      summary: "Get all tenants",
      description:
        "Returns a paginated list of tenants. Supports filtering by status, searching by name/description, and sorting.",
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by name or description (normalized)",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["true", "false", "all"],
            default: "all",
          },
          description: "Filter by active/inactive status",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Page number (min 1)",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 5, maximum: 500 },
          description: "Items per page (max 500)",
        },
        {
          name: "orderBy",
          in: "query",
          schema: {
            type: "string",
            enum: ["name", "created_at", "updated_at"],
            default: "name",
          },
          description: "Field to order results by",
        },
        {
          name: "sort",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          description: "Sorting direction",
        },
      ],
      responses: {
        200: {
          description: "List of tenants",
          content: {
            "application/json": {
              example: {
                total: 5,
                page: 1,
                limit: 10,
                data: [
                  {
                    id: "uuid-1",
                    name: "PERU - LIBRERÍA",
                    description:
                      "Empresa peruana especializada en libros escolares.",
                    status: true,
                    subsidiaries: [],
                  },
                  {
                    id: "uuid-2",
                    name: "BOLIVIA - MATERIAL DE ESCRITORIO",
                    description:
                      "Empresa boliviana dedicada a útiles escolares y oficina.",
                    status: true,
                    subsidiaries: [],
                  },
                  {
                    id: "uuid-3",
                    name: "PERU - JUGUETERÍA",
                    description:
                      "Empresa peruana enfocada en juguetes educativos.",
                    status: true,
                    subsidiaries: [],
                  },
                  {
                    id: "uuid-4",
                    name: "PERU - CAFETERÍA CULTURAL",
                    description:
                      "Cafetería que promueve actividades culturales y café peruano.",
                    status: true,
                    subsidiaries: [],
                  },
                  {
                    id: "uuid-5",
                    name: "TENANT TEMPORAL",
                    description:
                      "Tenant de prueba para verificar eliminación completa.",
                    status: true,
                    subsidiaries: [],
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /tenant/{id}": {
    get: {
      tags: ["Tenant"],
      summary: "Get tenant by ID",
      description:
        "Returns full tenant details including subsidiaries, users, schedules, and roles with permissions. Useful for management dashboards.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Tenant found",
          content: {
            "application/json": {
              example: {
                tenant: {
                  id: "uuid-1",
                  name: "PERU - LIBRERÍA",
                  description:
                    "Empresa peruana especializada en libros escolares.",
                  status: true,
                  created_at: "2025-06-01T10:00:00.000Z",
                  updated_at: "2025-06-15T12:00:00.000Z",
                },
                subsidiaries: [
                  {
                    id: "sub-uuid-1",
                    name: "Sucursal Lima",
                    address: "Av. Siempre Viva 123",
                    status: true,
                    tenantId: "uuid-1",
                    created_at: "2025-06-01T11:00:00.000Z",
                    updated_at: "2025-06-10T13:00:00.000Z",
                    schedulesSubsidiaries: [
                      {
                        id: "sched-1",
                        day: "LUNES",
                        open_time: "08:00",
                        close_time: "17:00",
                      },
                    ],
                    users: [
                      {
                        id: "user-uuid",
                        name: "Ana",
                        lastname: "Pérez",
                        email: "ana@example.com",
                        status: true,
                        role: {
                          id: "role-uuid",
                          name: "admin",
                        },
                        schedulesUsers: [
                          {
                            id: "sched-user-uuid",
                            day: "LUNES",
                            entry_time: "08:00",
                            exit_time: "16:00",
                          },
                        ],
                      },
                    ],
                    roles: [
                      {
                        id: "role-uuid",
                        name: "admin",
                        description: "Rol de administrador",
                        status: true,
                        rolePermissions: [
                          {
                            id: "perm-uuid",
                            action: {
                              id: "action-uuid",
                              name: "ver",
                            },
                            section: {
                              id: "section-uuid",
                              name: "Usuarios",
                            },
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
        404: { description: "Tenant not found" },
      },
    },
  },
};
