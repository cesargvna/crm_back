export const moduleGroupPaths = {
  "POST: role/permission-module": {
    post: {
      tags: ["Permission Module"],
      summary: "Create a permission module group",
      description:
        "Creates a new permission module group under a section. Name must be unique within the section and contain only letters or '.' (no spaces, ñ, or numbers).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "route", "iconName", "sectionId"],
              properties: {
                name: {
                  type: "string",
                  example: "Dashboard",
                },
                route: {
                  type: "string",
                  example: "/dashboard",
                },
                iconName: {
                  type: "string",
                  example: "dashboardIcon",
                },
                sectionId: {
                  type: "string",
                  format: "uuid",
                  example: "8a6e9b52-17d5-4cfc-8c7a-23d0bd8888d3",
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Module group created successfully" },
        400: { description: "Validation error" },
        409: { description: "Module already exists in this section" },
      },
    },
  },
  "PUT: role/permission-module/{id}": {
    put: {
      tags: ["Permission Module"],
      summary: "Update a permission module group",
      description:
        "Updates a permission module group. Name must remain unique within its section and follow naming rules.",
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
              required: ["name", "route", "iconName", "sectionId"],
              properties: {
                name: {
                  type: "string",
                  example: "Inventory",
                },
                route: {
                  type: "string",
                  example: "/inventory",
                },
                iconName: {
                  type: "string",
                  example: "inventoryIcon",
                },
                sectionId: {
                  type: "string",
                  format: "uuid",
                  example: "8a6e9b52-17d5-4cfc-8c7a-23d0bd8888d3",
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Module group updated successfully" },
        400: { description: "Validation error" },
        409: { description: "Module already exists in this section" },
      },
    },
  },
  "PATCH: role/permission-module/{id}/status": {
    patch: {
      tags: ["Permission Module"],
      summary: "Toggle status of a permission module group",
      description:
        "Toggles the active/inactive status of a permission module group.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Module group status toggled" },
        404: { description: "Module group not found" },
      },
    },
  },
  "GET: role/permission-module": {
    get: {
      tags: ["Permission Module"],
      summary: "Get all permission module groups",
      description:
        "Returns a paginated list of permission module groups with optional filters such as search, status, and sorting.",
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by module name",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["true", "false", "all"],
            default: "all",
          },
          description: "Filter by module status",
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
          description: "Field to order by",
        },
        {
          name: "sort",
          in: "query",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
          },
          description: "Sorting direction",
        },
      ],
      responses: {
        200: { description: "List of module groups returned" },
      },
    },
  },
  "GET: role/permission-module/{id}": {
    get: {
      tags: ["Permission Module"],
      summary: "Get a permission module group by ID",
      description:
        "Returns a permission module group along with its submodules and parent section.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Module group found" },
        404: { description: "Module group not found" },
      },
    },
  },
  "GET: role/permission-module-complete": {
    get: {
      tags: ["Permission Module"],
      summary: "Get all permission modules with submodules",
      description:
        "Returns all permission module groups with their submodules and parent section details. Used for full visualization or sidebar building.",
      responses: {
        200: { description: "Full module group hierarchy returned" },
      },
    },
  },
};