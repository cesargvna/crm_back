export const permissionSectionPaths = {
  "POST: role/permission-sections": {
    post: {
      tags: ["Permission Section"],
      summary: "Create a permission section",
      description:
        "Creates a new permission section. The name must be unique, normalized (no accents), and contain only letters or '.' (no spaces, ñ, or numbers).",
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
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    example: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                  },
                  name: { type: "string", example: "reports" },
                  order: { type: "integer", example: 1 },
                  status: { type: "boolean", example: true },
                  created_at: {
                    type: "string",
                    format: "date-time",
                    example: "2025-06-15T15:14:03.000Z",
                  },
                  updated_at: {
                    type: "string",
                    format: "date-time",
                    example: "2025-06-15T15:14:03.000Z",
                  },
                },
              },
              example: {
                id: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                name: "reports",
                order: 1,
                status: true,
                created_at: "2025-06-15T15:14:03.000Z",
                updated_at: "2025-06-15T15:14:03.000Z",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              example: {
                message: "Name must be at least 3 characters",
              },
            },
          },
        },
        409: {
          description: "Name already exists",
          content: {
            "application/json": {
              example: {
                message: 'Section "Reports" already exists.',
              },
            },
          },
        },
      },
    },
  },
  "PUT: role/permission-sections/{id}": {
    put: {
      tags: ["Permission Section"],
      summary: "Update a permission section",
      description:
        "Updates the name and order of a permission section. The name must remain unique and valid.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
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
        200: {
          description: "Permission section updated",
          content: {
            "application/json": {
              example: {
                id: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                name: "inventory",
                order: 2,
                status: true,
                created_at: "2025-06-10T15:14:03.000Z",
                updated_at: "2025-06-15T17:30:00.000Z",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              example: { message: "Name must be at least 3 characters" },
            },
          },
        },
        409: {
          description: "Name already exists",
          content: {
            "application/json": {
              example: { message: 'Section "Inventory" already exists.' },
            },
          },
        },
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
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Status toggled successfully",
          content: {
            "application/json": {
              example: {
                id: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                name: "inventory",
                order: 2,
                status: false,
                created_at: "2025-06-10T15:14:03.000Z",
                updated_at: "2025-06-15T18:10:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Permission section not found",
          content: {
            "application/json": {
              example: { message: "Permission section not found" },
            },
          },
        },
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
        { name: "search", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["true", "false", "all"] },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 5, maximum: 500 },
        },
        {
          name: "orderBy",
          in: "query",
          schema: {
            type: "string",
            enum: ["name", "order", "created_at", "updated_at"],
          },
        },
        {
          name: "sort",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"] },
        },
      ],
      responses: {
        200: {
          description: "List of permission sections",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                data: [
                  {
                    id: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                    name: "inventory",
                    order: 2,
                    status: true,
                    created_at: "2025-06-10T15:14:03.000Z",
                    updated_at: "2025-06-15T17:30:00.000Z",
                  },
                  {
                    id: "a12dcbb1-7b55-1aa2-b93f-b43e78f8cbab",
                    name: "reports",
                    order: 1,
                    status: true,
                    created_at: "2025-06-01T10:00:00.000Z",
                    updated_at: "2025-06-01T10:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
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
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Permission section found",
          content: {
            "application/json": {
              example: {
                id: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                name: "inventory",
                order: 2,
                status: true,
                created_at: "2025-06-10T15:14:03.000Z",
                updated_at: "2025-06-15T17:30:00.000Z",
                modules: [
                  {
                    id: "mod-1",
                    name: "Products",
                    submodules: [
                      { id: "sub-1", name: "Create Product" },
                      { id: "sub-2", name: "Edit Product" },
                    ],
                  },
                ],
              },
            },
          },
        },
        404: {
          description: "Permission section not found",
          content: {
            "application/json": {
              example: { message: "Permission section not found" },
            },
          },
        },
      },
    },
  },
  "GET: role/permission-sections-complete": {
    get: {
      tags: ["Permission Section"],
      summary:
        "Get all permission sections with modules and submodules (filtered by roleId)",
      description:
        "Returns the full hierarchy of active permission sections, including their modules and submodules, filtered by roleId (if role is not 'System.Admin', the section 'Administración' is excluded). No pagination.",
      parameters: [
        {
          name: "roleId",
          in: "query",
          description: "ID of the role to filter sections (required)",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      ],
      responses: {
        "200": {
          description: "Full permission hierarchy returned",
          content: {
            "application/json": {
              example: [
                {
                  id: "b46dcbb1-6a58-4de1-b93f-b43e78f8cbff",
                  name: "inventory",
                  order: 2,
                  status: true,
                  created_at: "2025-06-10T15:14:03.000Z",
                  updated_at: "2025-06-15T17:30:00.000Z",
                  modules: [
                    {
                      id: "mod-1",
                      name: "Products",
                      submodules: [
                        { id: "sub-1", name: "Create Product" },
                        { id: "sub-2", name: "Edit Product" },
                      ],
                    },
                  ],
                },
                {
                  id: "a12dcbb1-7b55-1aa2-b93f-b43e78f8cbab",
                  name: "reports",
                  order: 1,
                  status: true,
                  created_at: "2025-06-01T10:00:00.000Z",
                  updated_at: "2025-06-01T10:00:00.000Z",
                  modules: [],
                },
              ],
            },
          },
        },
        "400": {
          description: "Missing roleId parameter",
        },
        "404": {
          description: "Role not found",
        },
      },
    },
  },
};
