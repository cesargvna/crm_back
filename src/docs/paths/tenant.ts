export const tenantPaths = {
  // ✅ CREATE TENANT
  "POST: /tenant": {
    post: {
      tags: ["Tenant"],
      summary: "Create a new tenant",
      description: `
Creates a new tenant.  
- The \`name\` must be unique, normalized: trims spaces, replaces "ñ" with "n", allows only letters, numbers, ".", ",", "-" and spaces.  
- Multiple spaces are reduced to one.  
- Allows setting \`maxSubsidiaries\`, \`maxUsers\`, \`maxRoles\`.
`,
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
                maxSubsidiaries: {
                  type: "integer",
                  example: 3,
                },
                maxUsers: {
                  type: "integer",
                  example: 50,
                },
                maxRoles: {
                  type: "integer",
                  example: 5,
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
                name: "peru - libreria",
                description: "Empresa peruana especializada en libros escolares.",
                maxSubsidiaries: 3,
                maxUsers: 50,
                maxRoles: 5,
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

  // ✅ UPDATE TENANT
  "PUT: /tenant/{id}": {
    put: {
      tags: ["Tenant"],
      summary: "Update tenant",
      description: `
Updates a tenant's name, description and limits.  
- Name remains unique and normalized.  
- Limits (\`maxSubsidiaries\`, \`maxUsers\`, \`maxRoles\`) cannot be set below current usage.
`,
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
                maxSubsidiaries: {
                  type: "integer",
                  example: 2,
                },
                maxUsers: {
                  type: "integer",
                  example: 10,
                },
                maxRoles: {
                  type: "integer",
                  example: 4,
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
                name: "bolivia - material de oficina",
                description: "Distribuidora de útiles de oficina y escolares.",
                maxSubsidiaries: 2,
                maxUsers: 10,
                maxRoles: 4,
                status: true,
                created_at: "2025-06-10T08:00:00.000Z",
                updated_at: "2025-06-15T12:00:00.000Z",
              },
            },
          },
        },
        400: { description: "Validation error or limit too low" },
        409: { description: "Tenant name already exists" },
      },
    },
  },

  // ✅ TOGGLE STATUS TENANT
  "PATCH: /tenant/{id}/status": {
    patch: {
      tags: ["Tenant"],
      summary: "Toggle tenant status",
      description: `
Toggles the tenant \`status\` (active/inactive).  
- Cascades to all related users, roles, and subsidiaries.
- Also updates users and roles under each subsidiary.
`,
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
          description: "Tenant status updated",
          content: {
            "application/json": {
              example: {
                message: "Tenant status updated to inactive",
                updated: {
                  tenantStatus: false,
                  affectedEntities: {
                    users: "All users under tenant and subsidiaries set to false",
                    subsidiaries: "All subsidiaries under tenant set to false",
                    roles: "All roles under tenant and subsidiaries set to false",
                  },
                },
                tenant: {
                  id: "uuid-1",
                  name: "peru - libreria",
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

  // ✅ GET ALL TENANTS
  "GET: /tenant": {
    get: {
      tags: ["Tenant"],
      summary: "Get all tenants",
      description: `
Returns a paginated list of tenants.  
- Supports search by \`name\` (normalized).  
- Filter by \`status\`: "true", "false", or "all".  
- Includes pagination: \`page\`, \`limit\`, and \`totalPages\`.
`,
      parameters: [
        { name: "search", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["true", "false", "all"], default: "all" },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5 } },
      ],
      responses: {
        200: {
          description: "List of tenants",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                tenants: [
                  {
                    id: "uuid-1",
                    name: "peru - libreria",
                    status: true,
                  },
                  {
                    id: "uuid-2",
                    name: "bolivia - material de oficina",
                    status: true,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  // ✅ GET TENANT BY ID
  "GET: /tenant/{id}": {
    get: {
      tags: ["Tenant"],
      summary: "Get tenant by ID",
      description: `
Returns full tenant details.  
- Includes subsidiaries.  
- Each subsidiary includes users with role and schedulesSubsidiaries.
`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Tenant found",
          content: {
            "application/json": {
              example: {
                tenant: {
                  id: "uuid-1",
                  name: "peru - libreria",
                  status: true,
                  subsidiaries: [
                    {
                      id: "sub-uuid",
                      name: "Sucursal A",
                      status: true,
                      subsidiary_type: "MATRIZ",
                      users: [
                        {
                          id: "user-uuid",
                          username: "juan",
                          status: true,
                          role: {
                            id: "role-uuid",
                            name: "admin",
                          },
                        },
                      ],
                      schedulesSubsidiaries: [
                        {
                          id: "sched-uuid",
                          status: true,
                          start_day: "LUNES",
                          end_day: "VIERNES",
                          opening_hour: "08:00",
                          closing_hour: "16:00",
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        404: { description: "Tenant not found" },
      },
    },
  },
};
