export const allowedActionPaths = {
  "POST: role/allowed-action": {
    post: {
      tags: ["Allowed Action"],
      summary: "Create an allowed action",
      description: "Links a PermissionAction to a Module or Submodule. Composite key prevents duplicates.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["actionId"],
              properties: {
                actionId: { type: "string", format: "uuid", example: "uuid" },
                moduleId: { type: "string", format: "uuid", example: "uuid", nullable: true },
                submoduleId: { type: "string", format: "uuid", example: "uuid", nullable: true },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "AllowedAction created",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                actionId: "uuid",
                moduleId: "uuid",
                submoduleId: null,
                compositeKey: "uuid-uuid-",
                created_at: "2025-06-30T12:00:00Z",
                updated_at: "2025-06-30T12:00:00Z",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              example: {
                message: "Either moduleId or submoduleId is required.",
              },
            },
          },
        },
        409: {
          description: "Duplicate error",
          content: {
            "application/json": {
              example: {
                message: "AllowedAction already exists for this combination.",
              },
            },
          },
        },
      },
    },
  },

  "GET: role/allowed-action": {
    get: {
      tags: ["Allowed Action"],
      summary: "Get all allowed actions",
      description: "Returns all allowed actions, optionally filtered by moduleId or submoduleId.",
      parameters: [
        { name: "moduleId", in: "query", schema: { type: "string", format: "uuid" } },
        { name: "submoduleId", in: "query", schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "List of allowed actions",
          content: {
            "application/json": {
              example: [
                {
                  id: "uuid",
                  actionId: "uuid",
                  moduleId: "uuid",
                  submoduleId: null,
                  compositeKey: "uuid-uuid-",
                },
              ],
            },
          },
        },
      },
    },
  },

  "DELETE: role/allowed-action/{id}": {
    delete: {
      tags: ["Allowed Action"],
      summary: "Delete an allowed action",
      description: "Deletes an AllowedAction by ID. This only removes the link, not the actual PermissionAction or Module/Submodule.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "AllowedAction deleted successfully",
          content: {
            "application/json": {
              example: { message: "AllowedAction deleted successfully." },
            },
          },
        },
        404: {
          description: "AllowedAction not found",
          content: {
            "application/json": {
              example: { message: "AllowedAction not found." },
            },
          },
        },
      },
    },
  },
};