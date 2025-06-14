export const rolePaths = {
  "POST: role/roles": {
    post: {
      tags: ["Role"],
      summary: "Create a new role",
      description:
        "Creates a new role associated with a specific tenant and subsidiary. The role name must be unique within that context.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "Administrador" },
                description: {
                  type: "string",
                  example: "Rol con permisos completos",
                },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Role created successfully" },
        409: {
          description: "Role already exists in this tenant and subsidiary",
        },
        400: {
          description:
            "The selected subsidiary does not belong to the specified tenant",
        },
      },
    },
  },

  "PUT: role/roles/{id}": {
    put: {
      tags: ["Role"],
      summary: "Update a role",
      description: "Updates the name and/or description of a role.",
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
                name: { type: "string", example: "Cajero Principal" },
                description: {
                  type: "string",
                  example: "Rol con permisos limitados",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Role updated successfully" },
        404: { description: "Role not found" },
      },
    },
  },

  "PATCH: role/roles/{id}/status": {
    patch: {
      tags: ["Role"],
      summary: "Toggle role status",
      description:
        "Enables or disables a role. If disabled, all users assigned to this role will also be deactivated.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: { type: "boolean", example: false },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Role and related users updated successfully" },
        404: { description: "Role not found" },
      },
    },
  },

  "GET: role/roles/{id}/permissions": {
    get: {
      tags: ["Role"],
      summary: "Get role with permissions",
      description:
        "Returns a role with all its associated permissions, actions and sections.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Role with permissions found" },
        404: { description: "Role not found" },
      },
    },
  },

  "GET: role/roles/{id}": {
    get: {
      tags: ["Role"],
      summary: "Get role by ID (extended)",
      description:
        "Returns a role along with its subsidiary, tenant, users, and permissions.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Role found" },
        404: { description: "Role not found" },
      },
    },
  },

  "GET: role/roles/by-subsidiary/{subsidiaryId}": {
    get: {
      tags: ["Role"],
      summary: "Get all roles by subsidiary",
      description: `
Returns a paginated list of roles associated with a specific subsidiary. You can filter results using query parameters:

- \`search\`: partial name search (case-insensitive)
- \`status\`: filter by role status \`true\`, \`false\` or \`all\`
- \`orderBy\`: field to sort by (default: \`name\`)
- \`sort\`: sort direction \`asc\` or \`desc\`
- \`page\`: pagination page (default: 1)
- \`limit\`: number of items per page (default: 10, max: 100)

Each role includes its assigned users, permissions, and associated tenant info.
      `,
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string" },
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
          schema: { type: "string", default: "name" },
        },
        {
          name: "sort",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description: "Paginated list of roles for the subsidiary",
        },
        400: { description: "Invalid query or subsidiaryId" },
      },
    },
  },

  "GET: role/roles/by-tenant/{tenantId}": {
    get: {
      tags: ["Role"],
      summary: "Get all roles grouped by subsidiary for a tenant",
      description: `
Returns a structured list of all roles grouped by subsidiary for the given tenant ID. 
Each role includes its name, status, and a list of assigned permissions with resolved action, section, module and submodule names.
    `,
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
          description: "Roles grouped by subsidiary for the specified tenant",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tenant: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "tenant-789",
                      },
                      name: {
                        type: "string",
                        example: "PERU - LIBRERÍA",
                      },
                      description: {
                        type: "string",
                        example:
                          "Empresa peruana especializada en libros escolares.",
                      },
                    },
                  },
                  subsidiaries: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Sucursal Central" },
                        roles: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                                example: "Administrador",
                              },
                              status: {
                                type: "boolean",
                                example: true,
                              },
                              permissions: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    action: {
                                      type: "string",
                                      example: "ver",
                                    },
                                    section: {
                                      type: "string",
                                      example: "Usuarios",
                                    },
                                    module: {
                                      type: "string",
                                      nullable: true,
                                      example: "Dashboard",
                                    },
                                    submodule: {
                                      type: "string",
                                      nullable: true,
                                      example: "Reportes Detallados",
                                    },
                                  },
                                },
                              },
                            },
                          },
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
          description: "Tenant not found",
        },
      },
    },
  },
};
