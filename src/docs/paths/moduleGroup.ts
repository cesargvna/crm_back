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
                name: { type: "string", example: "Dashboard" },
                route: { type: "string", example: "/dashboard" },
                iconName: { type: "string", example: "DashboardCustomizeIcon" },
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
        201: {
          description: "Module group created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "dashboard",
                route: "/dashboard",
                iconName: "DashboardCustomizeIcon",
                sectionId: "8a6e9b52-17d5-4cfc-8c7a-23d0bd8888d3",
                status: true,
                createdAt: "2025-06-15T12:00:00Z",
                updatedAt: "2025-06-15T12:00:00Z",
              },
            },
          },
        },
        400: { description: "Validation error" },
        409: {
          description: "Module already exists in this section",
          content: {
            "application/json": {
              example: {
                message: 'Module "Dashboard" already exists in the section.',
              },
            },
          },
        },
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
                name: { type: "string", example: "Inventory" },
                route: { type: "string", example: "/inventory" },
                iconName: { type: "string", example: "Inventory2Icon" },
                sectionId: {
                  type: "string",
                  format: "uuid",
                  example: "3c1f5bb3-47a6-4e4b-94e2-66e70d42dc7e",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Module group updated successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "inventory",
                route: "/inventory",
                iconName: "Inventory2Icon",
                sectionId: "3c1f5bb3-47a6-4e4b-94e2-66e70d42dc7e",
                status: true,
                updatedAt: "2025-06-15T12:15:00Z",
              },
            },
          },
        },
        400: { description: "Validation error" },
        409: {
          description: "Module already exists in this section",
          content: {
            "application/json": {
              example: {
                message: 'Module "Inventory" already exists in the section.',
              },
            },
          },
        },
      },
    },
  },

  "PATCH: role/permission-module/{id}/status": {
    patch: {
      tags: ["Permission Module"],
      summary: "Toggle status of a permission module group",
      description: "Toggles the active/inactive status of a permission module group.",
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
          description: "Module group status toggled",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "dashboard",
                status: false,
              },
            },
          },
        },
        404: {
          description: "Module group not found",
          content: {
            "application/json": {
              example: { message: "Module group not found" },
            },
          },
        },
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
        { name: "search", in: "query", schema: { type: "string" }, description: "Search by module name" },
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["true", "false", "all"], default: "all" },
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
            enum: ["name", "createdAt", "updatedAt"],
            default: "name",
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
          description: "List of module groups returned",
          content: {
            "application/json": {
              example: {
                total: 30,
                page: 1,
                limit: 5,
                data: [
                  {
                    id: "uuid",
                    name: "ventas",
                    route: "/sales",
                    iconName: "PointOfSaleIcon",
                    sectionId: "uuid",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "productos",
                    route: "/products",
                    iconName: "Inventory2Icon",
                    sectionId: "uuid",
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

  "GET: role/permission-module/{id}": {
    get: {
      tags: ["Permission Module"],
      summary: "Get a permission module group by ID",
      description: "Returns a permission module group along with its submodules and parent section.",
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
          description: "Module group found",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "ventas",
                route: "/sales",
                iconName: "PointOfSaleIcon",
                section: {
                  id: "uuid",
                  name: "Ventas",
                },
                submodules: [],
              },
            },
          },
        },
        404: {
          description: "Module group not found",
          content: {
            "application/json": {
              example: { message: "Module group not found" },
            },
          },
        },
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
        200: {
          description: "Full module group hierarchy returned",
          content: {
            "application/json": {
              example: [
                {
                  id: "uuid",
                  name: "ventas",
                  route: "/sales",
                  iconName: "PointOfSaleIcon",
                  section: { id: "uuid", name: "Ventas" },
                  submodules: [
                    {
                      id: "uuid",
                      name: "Historial de ventas",
                      route: "/sales/history",
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  },
};
