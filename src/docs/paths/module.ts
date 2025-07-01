export const modulePaths = {
  "POST: role/module": {
    post: {
      tags: ["Module"],
      summary: "Create a permission module group",
      description:
        "Creates a new permission module group under a section. The name must be unique within the section and contain only letters (no spaces, ñ, numbers or symbols).",
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
                id: "f91d9c9b-6f50-4a90-9c18-0db8cfe44e2f",
                name: "dashboard",
                route: "/dashboard",
                iconName: "DashboardCustomizeIcon",
                sectionId: "8a6e9b52-17d5-4cfc-8c7a-23d0bd8888d3",
                created_at: "2025-07-01T10:00:00Z",
                updated_at: "2025-07-01T10:00:00Z",
              },
            },
          },
        },
        409: {
          description: "Module already exists in this section",
          content: {
            "application/json": {
              example: {
                message: 'Module "dashboard" already exists in the section.',
              },
            },
          },
        },
      },
    },
  },

  "PUT: role/module/{id}": {
    put: {
      tags: ["Module"],
      summary: "Update a permission module group",
      description:
        "Updates a permission module group. Name must remain unique within its section and follow naming rules.",
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
                id: "f91d9c9b-6f50-4a90-9c18-0db8cfe44e2f",
                name: "inventory",
                route: "/inventory",
                iconName: "Inventory2Icon",
                sectionId: "3c1f5bb3-47a6-4e4b-94e2-66e70d42dc7e",
                created_at: "2025-07-01T10:00:00Z",
                updated_at: "2025-07-01T12:00:00Z",
              },
            },
          },
        },
        409: {
          description: "Module already exists in this section",
          content: {
            "application/json": {
              example: {
                message: 'Module "inventory" already exists in the section.',
              },
            },
          },
        },
      },
    },
  },

  "GET: role/module/{id}": {
    get: {
      tags: ["Module"],
      summary: "Get a permission module group by ID",
      description:
        "Returns a permission module group along with its parent section and submodules.",
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
          description: "Module group found",
          content: {
            "application/json": {
              example: {
                id: "f91d9c9b-6f50-4a90-9c18-0db8cfe44e2f",
                name: "inventory",
                route: "/inventory",
                iconName: "Inventory2Icon",
                section: {
                  id: "3c1f5bb3-47a6-4e4b-94e2-66e70d42dc7e",
                  name: "Gestión",
                },
                submodules: [
                  {
                    id: "submod-1",
                    name: "Create Product",
                    route: "/inventory/create",
                  },
                  {
                    id: "submod-2",
                    name: "Edit Product",
                    route: "/inventory/edit",
                  },
                ],
                created_at: "2025-07-01T10:00:00Z",
                updated_at: "2025-07-01T12:00:00Z",
              },
            },
          },
        },
        404: {
          description: "Module group not found",
          content: {
            "application/json": {
              example: {
                message: "Module not found.",
              },
            },
          },
        },
      },
    },
  },
};
