export const subsidiaryPaths = {
  "POST: /subsidiary": {
    post: {
      tags: ["Subsidiary"],
      summary: "Create a new subsidiary",
      description: "Creates a new subsidiary under a specific tenant. The `subsidiary_type` must be one of: MATRIZ, SUCURSAL, ALMACEN, OFICINA.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "subsidiary_type", "tenantId"],
              properties: {
                name: { type: "string", example: "Sucursal La Paz" },
                subsidiary_type: {
                  type: "string",
                  enum: ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"],
                  example: "SUCURSAL"
                },
                tenantId: { type: "string", format: "uuid" },
                allowNegativeStock: { type: "boolean", example: false },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "1234567" },
                description: { type: "string", example: "Sucursal ubicada en La Paz" },
                address: { type: "string", example: "Av. Bolívar 123" },
                city: { type: "string", example: "La Paz" },
                country: { type: "string", example: "Bolivia" },
                cellphone: { type: "string", example: "+59171234567" },
                telephone: { type: "string", example: "2123456" },
                email: { type: "string", format: "email", example: "lapaz@empresa.com" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Subsidiary created successfully" },
        409: { description: "Subsidiary already exists in this tenant" },
      },
    },
  },

  "PUT: /subsidiary/{id}": {
    put: {
      tags: ["Subsidiary"],
      summary: "Update an existing subsidiary",
      description: "Updates subsidiary details by ID. The `subsidiary_type` must be one of: MATRIZ, SUCURSAL, ALMACEN, OFICINA.",
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
                allowNegativeStock: { type: "boolean" },
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
        200: { description: "Subsidiary updated successfully" },
        409: { description: "Subsidiary name already exists" },
      },
    },
  },

  "PATCH: /subsidiary/{id}/status": {
    patch: {
      tags: ["Subsidiary"],
      summary: "Toggle subsidiary status",
      description: "Toggles the `status` (active/inactive) of a subsidiary. This operation will also update all users and roles assigned to the subsidiary to match the new status.\n\n- When deactivated: `user.status = false`, `role.status = false`\n- When reactivated: `user.status = true`, `role.status = true`.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Subsidiary status updated, and user/role statuses updated accordingly" },
        404: { description: "Subsidiary not found" },
      },
    },
  },

  "DELETE: /subsidiary/{id}": {
    delete: {
      tags: ["Subsidiary"],
      summary: "Delete a subsidiary",
      description: "Deletes a subsidiary and all related users and roles.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Subsidiary and related data deleted successfully" },
        404: { description: "Subsidiary not found" },
      },
    },
  },

  "GET: /subsidiary/tenantid/{tenantId}": {
    get: {
      tags: ["Subsidiary"],
      summary: "Get subsidiaries by tenant ID",
      description: "Returns a paginated list of subsidiaries belonging to a specific tenant.",
      parameters: [
        { name: "tenantId", in: "path", required: true, schema: { type: "string" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["true", "false", "all"] } },
        { name: "type", in: "query", schema: { type: "string", enum: ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"] } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5, maximum: 1000 } },
        { name: "orderBy", in: "query", schema: { type: "string", default: "name" } },
        { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
      ],
      responses: {
        200: { description: "List of subsidiaries" },
        400: { description: "tenantId is required" },
      },
    },
  },

  "GET: /subsidiary/{id}": {
    get: {
      tags: ["Subsidiary"],
      summary: "Get a subsidiary by ID",
      description: "Returns a subsidiary and its related users, roles, and schedules.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Subsidiary found" },
        404: { description: "Subsidiary not found" },
      },
    },
  },
};
