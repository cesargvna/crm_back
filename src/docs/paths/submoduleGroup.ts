export const submoduleGroupPaths = {
  "POST: role/permission-submodule": {
    post: {
      tags: ["Permission Submodule"],
      summary: "Create a permission submodule group",
      description:
        "Creates a new permission submodule under a module. Name must be unique within the module and contain only letters or '.' (no spaces, ñ, or numbers).",
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
          description: "Submodule group created successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "createsale",
                route: "/ventas/crear",
                moduleId: "3fbf998e-0021-4c1b-b78c-ccd347fc3a99",
                status: true,
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
                message: "Route must be at most 255 characters",
              },
            },
          },
        },
        409: {
          description: "Submodule already exists in this module",
          content: {
            "application/json": {
              example: {
                message: 'Submodule "CreateSale" already exists in the module.',
              },
            },
          },
        },
      },
    },
  },

  "PUT: role/permission-submodule/{id}": {
    put: {
      tags: ["Permission Submodule"],
      summary: "Update a permission submodule group",
      description:
        "Updates a permission submodule. Name must remain unique within the module and follow validation rules.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", example: "uuid" },
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
          description: "Submodule group updated successfully",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "editsale",
                route: "/ventas/editar",
                moduleId: "3fbf998e-0021-4c1b-b78c-ccd347fc3a99",
                status: true,
                updatedAt: "2025-06-15T12:30:00.000Z",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              example: {
                message: "Only letters and '.' are allowed",
              },
            },
          },
        },
        409: {
          description: "Submodule already exists in this module",
          content: {
            "application/json": {
              example: {
                message: 'Submodule "EditSale" already exists in the module.',
              },
            },
          },
        },
      },
    },
  },

  "PATCH: role/permission-submodule/{id}/status": {
    patch: {
      tags: ["Permission Submodule"],
      summary: "Toggle status of a permission submodule group",
      description: "Toggles the active/inactive status of the submodule group.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", example: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Submodule group status toggled",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "editsale",
                status: false,
              },
            },
          },
        },
        404: {
          description: "Submodule group not found",
          content: {
            "application/json": {
              example: {
                message: "Submodule group not found",
              },
            },
          },
        },
      },
    },
  },

  "GET: role/permission-submodule": {
    get: {
      tags: ["Permission Submodule"],
      summary: "Get all permission submodule groups",
      description:
        "Returns a paginated list of submodule groups. Supports filtering by status, searching by name, and sorting.",
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
            enum: ["name", "created_at", "updated_at"],
            default: "name",
          },
        },
        {
          name: "sort",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
        },
      ],
      responses: {
        200: {
          description: "List of submodule groups returned",
          content: {
            "application/json": {
              example: {
                total: 10,
                page: 1,
                limit: 5,
                data: [
                  {
                    id: "uuid",
                    name: "createsale",
                    route: "/ventas/crear",
                    moduleId: "uuid",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "editsale",
                    route: "/ventas/editar",
                    moduleId: "uuid",
                    status: false,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: role/permission-submodule/{id}": {
    get: {
      tags: ["Permission Submodule"],
      summary: "Get a permission submodule group by ID",
      description: "Returns a submodule group along with its associated module and section.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", example: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Submodule group found",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "createsale",
                route: "/ventas/crear",
                module: {
                  id: "uuid",
                  name: "Ventas",
                  section: {
                    id: "uuid",
                    name: "Ventas",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Submodule group not found",
          content: {
            "application/json": {
              example: {
                message: "Submodule group not found",
              },
            },
          },
        },
      },
    },
  },

  "GET: role/permission-submodule-complete": {
    get: {
      tags: ["Permission Submodule"],
      summary: "Get all permission submodules with their module and section",
      description:
        "Returns all submodule groups with their associated module and section names. Used for sidebar rendering or configuration.",
      responses: {
        200: {
          description: "Full submodule hierarchy returned",
          content: {
            "application/json": {
              example: [
                {
                  id: "uuid",
                  name: "createsale",
                  route: "/ventas/crear",
                  module: {
                    id: "uuid",
                    name: "Ventas",
                    section: {
                      id: "uuid",
                      name: "Ventas",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
};
