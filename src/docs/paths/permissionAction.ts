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
        201: { description: "Permission action created successfully" },
        400: { description: "Validation error" },
        409: { description: "Name already exists" },
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
                name: { type: "string", example: "edit" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Permission action updated" },
        400: { description: "Validation error" },
        409: { description: "Name already exists" },
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
        200: { description: "List of permission actions" },
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
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Permission action found" },
        404: { description: "Permission action not found" },
      },
    },
  },
};
