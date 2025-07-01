export const submodulePaths = {
  "POST: role/permission-submodule": {
    post: {
      tags: ["Submodule"],
      summary: "Create a permission submodule",
      description:
        "Creates a new permission submodule under a module. Name must be unique within the module and contain only letters (no ñ, no symbols, no numbers).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "route", "moduleId"],
              properties: {
                name: { type: "string", example: "CreateSale" },
                route: { type: "string", example: "/ventas/crear" },
                moduleId: {
                  type: "string",
                  format: "uuid",
                  example: "3fbf998e-0021-4c1b-b78c-ccd347fc3a99",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Submodule created successfully",
          content: {
            "application/json": {
              example: {
                id: "sub-uuid",
                name: "createsale",
                route: "/ventas/crear",
                moduleId: "3fbf998e-0021-4c1b-b78c-ccd347fc3a99",
                created_at: "2025-07-01T12:00:00Z",
                updated_at: "2025-07-01T12:00:00Z",
              },
            },
          },
        },
        409: {
          description: "Submodule already exists in this module",
          content: {
            "application/json": {
              example: {
                message: 'Submodule "createsale" already exists in the module.',
              },
            },
          },
        },
      },
    },
  },

  "PUT: role/permission-submodule/{id}": {
    put: {
      tags: ["Submodule"],
      summary: "Update a permission submodule",
      description:
        "Updates a permission submodule. Name must remain unique within the module and follow validation rules.",
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
              required: ["name", "route", "moduleId"],
              properties: {
                name: { type: "string", example: "EditSale" },
                route: { type: "string", example: "/ventas/editar" },
                moduleId: {
                  type: "string",
                  format: "uuid",
                  example: "3fbf998e-0021-4c1b-b78c-ccd347fc3a99",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Submodule updated successfully",
          content: {
            "application/json": {
              example: {
                id: "sub-uuid",
                name: "editsale",
                route: "/ventas/editar",
                moduleId: "3fbf998e-0021-4c1b-b78c-ccd347fc3a99",
                updated_at: "2025-07-01T12:30:00Z",
              },
            },
          },
        },
        409: {
          description: "Submodule already exists in this module",
          content: {
            "application/json": {
              example: {
                message: 'Submodule "editsale" already exists in the module.',
              },
            },
          },
        },
      },
    },
  },

  "GET: role/permission-submodule/{id}": {
    get: {
      tags: ["Submodule"],
      summary: "Get a permission submodule by ID",
      description: "Returns a submodule along with its module information.",
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
          description: "Submodule found",
          content: {
            "application/json": {
              example: {
                id: "sub-uuid",
                name: "createsale",
                route: "/ventas/crear",
                module: {
                  id: "mod-uuid",
                  name: "ventas",
                },
                created_at: "2025-07-01T12:00:00Z",
                updated_at: "2025-07-01T12:00:00Z",
              },
            },
          },
        },
        404: {
          description: "Submodule not found",
          content: {
            "application/json": {
              example: {
                message: "Submodule not found.",
              },
            },
          },
        },
      },
    },
  },
};