export const permissionActionPaths = {
  "POST: role/permission-action": {
    post: {
      tags: ["Permission Action"],
      summary: "Create a permission action",
      description:
        "Creates a new permission action. The name must be unique, normalized (no tildes, no ñ), and contain only letters.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "view" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Permission action created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "view",
                status: true,
                created_at: "2025-06-15T12:00:00.000Z",
                updated_at: "2025-06-15T12:00:00.000Z",
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
                message: 'Action "view" already exists.',
              },
            },
          },
        },
      },
    },
  },

  "PUT: role/permission-action/{id}": {
    put: {
      tags: ["Permission Action"],
      summary: "Update a permission action",
      description:
        "Updates the name of a permission action. Name must remain unique and valid.",
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
                name: { type: "string", example: "edit" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Permission action updated successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "edit",
                status: true,
                created_at: "2025-06-15T12:00:00.000Z",
                updated_at: "2025-06-15T13:00:00.000Z",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              example: {
                message: "Only letters are allowed. No ñ, spaces, numbers or symbols.",
              },
            },
          },
        },
        409: {
          description: "Name already exists",
          content: {
            "application/json": {
              example: {
                message: 'Action "edit" already exists.',
              },
            },
          },
        },
      },
    },
  },

  "PATCH: role/permission-action/{id}/status": {
    patch: {
      tags: ["Permission Action"],
      summary: "Toggle status of a permission action",
      description:
        "Toggles the status (active/inactive) of a permission action automatically. No request body needed.",
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
                id: "uuid",
                name: "edit",
                status: false,
                created_at: "2025-06-15T12:00:00.000Z",
                updated_at: "2025-06-15T13:30:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Permission action not found",
          content: {
            "application/json": {
              example: { message: "Permission action not found" },
            },
          },
        },
      },
    },
  },

  "GET: role/permission-action": {
    get: {
      tags: ["Permission Action"],
      summary: "Get all permission actions",
      description: "Returns a list of all permission actions sorted by name.",
      responses: {
        200: {
          description: "List of permission actions",
          content: {
            "application/json": {
              example: [
                {
                  id: "uuid",
                  name: "view",
                  status: true,
                  created_at: "2025-06-15T12:00:00.000Z",
                  updated_at: "2025-06-15T12:00:00.000Z",
                },
                {
                  id: "uuid",
                  name: "edit",
                  status: false,
                  created_at: "2025-06-15T12:05:00.000Z",
                  updated_at: "2025-06-15T12:10:00.000Z",
                },
              ],
            },
          },
        },
      },
    },
  },

  "GET: role/permission-action/{id}": {
    get: {
      tags: ["Permission Action"],
      summary: "Get a permission action by ID",
      description: "Returns a permission action by its ID.",
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
          description: "Permission action found",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "view",
                status: true,
                created_at: "2025-06-15T12:00:00.000Z",
                updated_at: "2025-06-15T12:00:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Permission action not found",
          content: {
            "application/json": {
              example: { message: "Permission action not found" },
            },
          },
        },
      },
    },
  },
};
