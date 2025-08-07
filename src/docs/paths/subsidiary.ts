export const subsidiaryPaths = {
  // ✅ CREATE
  "POST: /subsidiary": {
    post: {
      tags: ["Subsidiary"],
      summary: "Create a new subsidiary",
      description: `
Creates a new subsidiary under a specific tenant.  
- Requires \`tenantId\`.  
- The \`subsidiary_type\` must be one of: MATRIZ, SUCURSAL, ALMACEN, OFICINA.  
- Normalizes the name (removes tildes, trims spaces, allows ñ).  
- Respects the tenant's max limits for subsidiaries, roles and users.`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "subsidiary_type", "tenantId"],
              properties: {
                tenantId: { type: "string", format: "uuid", example: "uuid-tenant-456" },
                name: { type: "string", example: "Sucursal La Paz" },
                subsidiary_type: {
                  type: "string",
                  enum: ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"],
                  example: "SUCURSAL"
                },
                maxUsers: { type: "integer", example: 3 },
                maxRoles: { type: "integer", example: 2 },
                allowNegativeStock: { type: "boolean", example: false },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "1234567" },
                description: { type: "string", example: "Sucursal ubicada en La Paz" },
                address: { type: "string", example: "Av. Bolívar 123" },
                city: { type: "string", example: "La Paz" },
                country: { type: "string", example: "Bolivia" },
                cellphone: { type: "string", example: "+59171234567" },
                telephone: { type: "string", example: "+5912123456" },
                email: { type: "string", format: "email", example: "lapaz@empresa.com" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Subsidiary created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid-sample-123",
                name: "Sucursal La Paz",
                subsidiary_type: "SUCURSAL",
                tenantId: "uuid-tenant-456",
                maxUsers: 3,
                maxRoles: 2,
                allowNegativeStock: false,
                ci: "12345678",
                nit: "1234567",
                description: "Sucursal ubicada en La Paz",
                address: "Av. Bolívar 123",
                city: "La Paz",
                country: "Bolivia",
                cellphone: "+59171234567",
                telephone: "+5912123456",
                email: "lapaz@empresa.com",
                status: true,
                created_at: "2025-06-15T10:00:00Z",
                updated_at: "2025-06-15T10:00:00Z"
              }
            }
          }
        },
        400: { description: "Validation error or tenant limit reached" },
        409: { description: "Subsidiary already exists in this tenant" },
      },
    },
  },

  // ✅ UPDATE
  "PUT: /subsidiary/{id}": {
    put: {
      tags: ["Subsidiary"],
      summary: "Update an existing subsidiary",
      description: `
Updates subsidiary details by ID.  
- The \`subsidiary_type\` must be one of: MATRIZ, SUCURSAL, ALMACEN, OFICINA.  
- Name must remain unique within the tenant.`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "subsidiary_type"],
              properties: {
                name: { type: "string", example: "Sucursal La Paz Actualizada" },
                subsidiary_type: {
                  type: "string",
                  enum: ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"]
                },
                maxUsers: { type: "integer", example: 4 },
                maxRoles: { type: "integer", example: 3 },
                allowNegativeStock: { type: "boolean", example: false },
                ci: { type: "string" },
                nit: { type: "string" },
                description: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                country: { type: "string" },
                cellphone: { type: "string" },
                telephone: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Subsidiary updated successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid-sample-123",
                name: "Sucursal La Paz Actualizada",
                subsidiary_type: "SUCURSAL",
                status: true,
                updated_at: "2025-06-20T12:00:00Z"
              }
            }
          }
        },
        400: { description: "Validation error or limits exceeded" },
        409: { description: "Subsidiary name already exists" },
      },
    },
  },

  // ✅ TOGGLE STATUS
  "PATCH: /subsidiary/{id}/status": {
    patch: {
      tags: ["Subsidiary"],
      summary: "Toggle subsidiary status",
      description: `
Toggles the \`status\` (active/inactive) of a subsidiary.  
Also updates all users and roles under that subsidiary to match the new status:
- When deactivated: \`user.status = false\`, \`role.status = false\`.
- When reactivated: \`user.status = true\`, \`role.status = true\`.`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Subsidiary status updated and cascade applied",
          content: {
            "application/json": {
              example: {
                message: "Subsidiary status updated to inactive",
                updated: {
                  subsidiaryStatus: false,
                  affectedEntities: {
                    users: "All users under subsidiary set to false",
                    roles: "All roles under subsidiary set to false"
                  }
                },
                subsidiary: {
                  id: "uuid-sample-123",
                  name: "Sucursal La Paz",
                  status: false
                }
              }
            }
          }
        },
        404: { description: "Subsidiary not found" },
      },
    },
  },

  // ✅ GET ALL BY TENANT
  "GET: /subsidiary/tenantid/{tenantId}": {
    get: {
      tags: ["Subsidiary"],
      summary: "Get subsidiaries by tenant ID",
      description: `
Returns a paginated list of subsidiaries belonging to a specific tenant.  
Supports filtering by \`status\` (true, false, all), \`subsidiary_type\` and search in name/description.`,
      parameters: [
        { name: "tenantId", in: "path", required: true, schema: { type: "string" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["true", "false", "all"], default: "all" } },
        { name: "type", in: "query", schema: { type: "string", enum: ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"] } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5, maximum: 1000 } },
        { name: "orderBy", in: "query", schema: { type: "string", default: "name" } },
        { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
      ],
      responses: {
        200: {
          description: "List of subsidiaries",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                data: [
                  {
                    id: "uuid-sample-123",
                    name: "Sucursal La Paz",
                    subsidiary_type: "SUCURSAL",
                    tenantId: "uuid-tenant-456",
                    status: true,
                    created_at: "2025-06-15T10:00:00Z",
                    updated_at: "2025-06-15T10:00:00Z"
                  }
                ]
              }
            }
          }
        },
        400: { description: "tenantId is required" },
        404: { description: "Tenant not found" },
      },
    },
  },

  // ✅ GET BY ID
  "GET: /subsidiary/{id}": {
    get: {
      tags: ["Subsidiary"],
      summary: "Get a subsidiary by ID",
      description: `
Returns a subsidiary by its ID, including:
- Its related users with roles,
- SchedulesSubsidiaries,
- And its tenant.`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Subsidiary found",
          content: {
            "application/json": {
              example: {
                subsidiary: {
                  id: "uuid-sample-123",
                  name: "Sucursal La Paz",
                  subsidiary_type: "SUCURSAL",
                  tenant: {
                    id: "uuid-tenant-456",
                    name: "PERU - LIBRERIA",
                    status: true
                  },
                  users: [
                    {
                      id: "user-uuid-1",
                      username: "jdoe",
                      name: "John",
                      lastname: "Doe",
                      status: true,
                      email: "jdoe@example.com",
                      cellphone: "+59171234567",
                      role: {
                        id: "role-id-1",
                        name: "admin",
                        status: true
                      }
                    }
                  ],
                  schedulesSubsidiaries: [
                    {
                      id: "sched-uuid",
                      start_day: "LUNES",
                      end_day: "VIERNES",
                      opening_hour: "08:00",
                      closing_hour: "17:00",
                      status: true
                    }
                  ]
                }
              }
            }
          }
        },
        404: { description: "Subsidiary not found" },
      },
    },
  },
};
