export const permissionSectionPaths = {
  "POST: role/permission-sections": {
    post: {
      tags: ["Permission Section"],
      summary: "Create a permission section",
      description:
        "Creates a new permission section. Name must be unique, normalized (no tildes), and contain only letters or '.' (no spaces, ñ, or numbers).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Reports" },
                order: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Permission section created successfully" },
        400: { description: "Validation error" },
        409: { description: "Name already exists" },
      },
    },
  },
  "PUT: role/permission-sections/{id}": {
    put: {
      tags: ["Permission Section"],
      summary: "Update a permission section",
      description:
        "Updates the name and order of a permission section. Name must remain unique and valid.",
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
                name: { type: "string", example: "Inventory" },
                order: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Permission section updated" },
        400: { description: "Validation error" },
        409: { description: "Name already exists" },
      },
    },
  },
  "PATCH: role/permission-sections/{id}/status": {
    patch: {
      tags: ["Permission Section"],
      summary: "Toggle status of a permission section",
      description:
        "Toggles the current status (active/inactive) of a permission section.",
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
  "GET: role/permission-sections": {
    get: {
      tags: ["Permission Section"],
      summary: "Get all permission sections",
      description:
        "Returns a paginated list of permission sections. Supports filtering by status, searching by name, and sorting.",
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by name (min 3 characters, normalized)",
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
            enum: ["name", "order", "created_at", "updated_at"],
            default: "order",
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
        200: { description: "List of permission sections" },
      },
    },
  },
  "GET: role/permission-sections/{id}": {
    get: {
      tags: ["Permission Section"],
      summary: "Get a permission section by ID",
      description:
        "Returns a permission section with its modules and submodules.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Permission section found" },
        404: { description: "Permission section not found" },
      },
    },
  },
  "GET: role/permission-sections-complete": {
    get: {
      tags: ["Permission Section"],
      summary: "Get all permission sections with modules and submodules",
      description:
        "Returns the full hierarchy of active permission sections, including their modules and submodules. This is mainly used for sidebar generation or full system management views. No pagination.",
      responses: {
        200: {
          description: "Full permission hierarchy returned",
        },
      },
    },
  },
};
