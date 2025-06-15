export const permissionActionPaths = {
  "POST: role/permission-actions": {
    post: {
      tags: ["Permission Action"],
      summary: "Create a permission action",
      description:
        "Creates a new permission action. The name must be unique, normalized (no tildes), and contain only letters or '.' (no spaces, ñ, or numbers).",
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
                id: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
                name: "view",
                createdAt: "2025-06-15T12:00:00.000Z",
                updatedAt: "2025-06-15T12:00:00.000Z",
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

  "PUT: role/permission-actions/{id}": {
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
          schema: { type: "string", example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab" },
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
          description: "Permission action updated",
          content: {
            "application/json": {
              example: {
                id: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
                name: "edit",
                createdAt: "2025-06-10T11:00:00.000Z",
                updatedAt: "2025-06-15T13:30:00.000Z",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              example: {
                message: "Only letters and '.' are allowed. No ñ, spaces, numbers or symbols",
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

  "GET: role/permission-actions": {
    get: {
      tags: ["Permission Action"],
      summary: "Get all permission actions",
      description:
        "Returns a full list of available permission actions. No pagination or filters applied.",
      responses: {
        200: {
          description: "List of permission actions",
          content: {
            "application/json": {
              example: [
                {
                  id: "11111111-1111-1111-1111-111111111111",
                  name: "view",
                  createdAt: "2025-06-01T10:00:00.000Z",
                  updatedAt: "2025-06-01T10:00:00.000Z",
                },
                {
                  id: "22222222-2222-2222-2222-222222222222",
                  name: "edit",
                  createdAt: "2025-06-01T10:05:00.000Z",
                  updatedAt: "2025-06-01T10:05:00.000Z",
                },
              ],
            },
          },
        },
      },
    },
  },

  "GET: role/permission-actions/{id}": {
    get: {
      tags: ["Permission Action"],
      summary: "Get a permission action by ID",
      description: "Returns a specific permission action by its ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", example: "11111111-1111-1111-1111-111111111111" },
        },
      ],
      responses: {
        200: {
          description: "Permission action found",
          content: {
            "application/json": {
              example: {
                id: "11111111-1111-1111-1111-111111111111",
                name: "view",
                createdAt: "2025-06-01T10:00:00.000Z",
                updatedAt: "2025-06-01T10:00:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Permission action not found",
          content: {
            "application/json": {
              example: {
                message: "Permission action not found",
              },
            },
          },
        },
      },
    },
  },
};
