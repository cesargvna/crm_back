export const permissionSectionPaths = {
  "/permission-sections": {
    post: {
      tags: ["Permission Section"],
      summary: "Create a permission section",
      description:
        "Creates a new permission section. Name must be unique and contain only letters (no spaces, ñ, or numbers).",
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
                  example: "Reports",
                },
                order: {
                  type: "integer",
                  example: 1,
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Permission section created successfully",
        },
        400: {
          description: "Validation error",
        },
        409: {
          description: "Name already exists",
        },
      },
    },

    get: {
      tags: ["Permission Section"],
      summary: "Get all permission sections",
      description:
        "Returns a list of permission sections with optional filters such as search, status, pagination, and sorting.",
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by name (min 3 characters)",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["true", "false", "all"],
            default: "all",
          },
          description: "Filter by status",
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
            enum: ["name", "order", "created_at", "updated_at"],
            default: "order",
          },
          description: "Field to order by",
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
          description: "List of permission sections",
        },
      },
    },
  },

  "/permission-sections/{id}": {
    get: {
      tags: ["Permission Section"],
      summary: "Get permission section by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Permission section data" },
        404: { description: "Permission section not found" },
      },
    },

    put: {
      tags: ["Permission Section"],
      summary: "Update permission section",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Inventory" },
                order: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Permission section updated" },
        400: { description: "Validation error" },
        409: { description: "Name already exists" },
      },
    },
  },

  "/permission-sections/{id}/status": {
    patch: {
      tags: ["Permission Section"],
      summary: "Toggle status of permission section",
      description:
        "Toggles the status (active/inactive) of a permission section.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Status toggled successfully" },
        404: { description: "Permission section not found" },
      },
    },
  },
};
