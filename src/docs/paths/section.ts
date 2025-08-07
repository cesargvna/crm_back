export const sectionPaths = {
  "POST: /role/sections": {
    post: {
      tags: ["Section"],
      summary: "Create a new section",
      description:
        "Creates a new sidebar section. The name will be normalized (only letters, no accents, no ñ, no numbers, no points, no spaces) and must be unique. Order is optional.",
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
        201: {
          description: "Section created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "reports",
                order: 1,
                visibility: true,
                created_at: "2025-06-30T12:00:00Z",
                updated_at: "2025-06-30T12:00:00Z",
              },
            },
          },
        },
        409: {
          description: "Section already exists",
          content: {
            "application/json": {
              example: { message: 'Section "reports" already exists.' },
            },
          },
        },
      },
    },
  },

  "PUT: /role/sections/{id}": {
    put: {
      tags: ["Section"],
      summary: "Update a section",
      description:
        "Updates the name and order of an existing section. Name must remain unique.",
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
          description: "Section updated successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "inventory",
                order: 2,
                visibility: true,
                created_at: "2025-06-30T12:00:00Z",
                updated_at: "2025-07-01T10:00:00Z",
              },
            },
          },
        },
        409: {
          description: "Section name already exists",
          content: {
            "application/json": {
              example: { message: 'Section "inventory" already exists.' },
            },
          },
        },
      },
    },
  },

  "PATCH: /role/sections/{id}/visibility": {
    patch: {
      tags: ["Section"],
      summary: "Toggle visibility of a section",
      description:
        "Toggles the `visibility` of the section automatically from true to false or vice versa.",
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
          description: "Visibility toggled",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "inventory",
                order: 2,
                visibility: false,
                created_at: "2025-06-30T12:00:00Z",
                updated_at: "2025-07-01T12:30:00Z",
              },
            },
          },
        },
        404: {
          description: "Section not found",
          content: {
            "application/json": {
              example: { message: "Section not found." },
            },
          },
        },
      },
    },
  },

  "GET: /role/sections/visible": {
    get: {
      tags: ["Section"],
      summary: "Get all visible sections",
      description:
        "Returns a list of all sections with `visibility: true`, including modules and submodules, ordered by `order`.",
      responses: {
        200: {
          description: "List of visible sections",
          content: {
            "application/json": {
              example: [
                {
                  id: "section-1",
                  name: "inventory",
                  order: 1,
                  visibility: true,
                  modules: [
                    {
                      id: "module-1",
                      name: "Products",
                      submodules: [
                        { id: "sub-1", name: "Add Product" },
                        { id: "sub-2", name: "Edit Product" },
                      ],
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

  "GET: /role/sections/hidden": {
    get: {
      tags: ["Section"],
      summary: "Get all hidden sections",
      description:
        "Returns a list of all sections with `visibility: false`. Intended for system admin.",
      responses: {
        200: {
          description: "List of hidden sections",
          content: {
            "application/json": {
              example: [
                {
                  id: "section-2",
                  name: "legacy",
                  order: 99,
                  visibility: false,
                  modules: [],
                },
              ],
            },
          },
        },
      },
    },
  },

  "GET: /role/sections/sidebar/{roleId}": {
    get: {
      tags: ["Section"],
      summary: "Get sections filtered by role",
      description:
        "Returns sections with modules/submodules, filtered by `roleId`. If the role is not 'System.Admin', the section 'Administracion' is excluded.",
      parameters: [
        {
          name: "roleId",
          in: "path", // ✅ Ahora es parámetro de ruta
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Sections for sidebar",
          content: {
            "application/json": {
              example: [
                {
                  id: "section-1",
                  name: "inventory",
                  order: 1,
                  visibility: true,
                  modules: [
                    {
                      id: "module-1",
                      name: "Products",
                      submodules: [],
                    },
                  ],
                },
              ],
            },
          },
        },
        400: {
          description: "Missing roleId",
          content: {
            "application/json": {
              example: { message: "Missing roleId" },
            },
          },
        },
        404: {
          description: "Role not found",
          content: {
            "application/json": {
              example: { message: "Role not found" },
            },
          },
        },
      },
    },
  },
};
