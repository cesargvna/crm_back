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
                name: { type: "string", example: "PERU - LIBRERÍA" },
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
        201: { description: "Tenant created successfully" },
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
                name: { type: "string", example: "BOLIVIA - ESCOLAR" },
                description: {
                  type: "string",
                  example: "Distribuidora de material escolar en Bolivia.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Tenant updated successfully" },
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
        "Toggles the tenant `status` (active/inactive). This operation will also cascade the update to all related entities within the tenant:\n\n- When deactivated: `user.status = false`, `subsidiary.status = false`, `role.status = false`\n- When reactivated: `user.status = true`, `subsidiary.status = true`, `role.status = true`.",
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
        "Deletes the tenant and all related users, roles, and subsidiaries. Includes a count of deleted relations.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Tenant and related data deleted successfully" },
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
            enum: ["name", "description", "created_at", "updated_at"],
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
        200: { description: "List of tenants" },
      },
    },
  },

  "GET: /tenant/{id}": {
    get: {
      tags: ["Tenant"],
      summary: "Get tenant by ID",
      description:
        "Returns full tenant details including subsidiaries, users, and roles. Used in management dashboards.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Tenant found" },
        404: { description: "Tenant not found" },
      },
    },
  },
};
