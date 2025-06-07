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
        201: { description: "Submodule group created successfully" },
        400: { description: "Validation error" },
        409: { description: "Submodule already exists in this module" },
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
          schema: { type: "string" },
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
        200: { description: "Submodule group updated successfully" },
        400: { description: "Validation error" },
        409: { description: "Submodule already exists in this module" },
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
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Submodule group status toggled" },
        404: { description: "Submodule group not found" },
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
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search by submodule name",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["true", "false", "all"],
            default: "all",
          },
          description: "Filter by submodule status",
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
            enum: ["name", "created_at", "updated_at"],
            default: "name",
          },
          description: "Field to order by",
        },
        {
          name: "sort",
          in: "query",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
          },
          description: "Sorting direction",
        },
      ],
      responses: {
        200: { description: "List of submodule groups returned" },
      },
    },
  },

  "GET: role/permission-submodule/{id}": {
    get: {
      tags: ["Permission Submodule"],
      summary: "Get a permission submodule group by ID",
      description:
        "Returns a submodule group along with its associated module.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Submodule group found" },
        404: { description: "Submodule group not found" },
      },
    },
  },

  "GET: role/permission-submodule-complete": {
    get: {
      tags: ["Permission Submodule"],
      summary: "Get all permission submodules with their module and section",
      description:
        "Returns all submodule groups with their associated module and section names. " +
        "The results are ordered alphabetically by name and used for configuration or sidebar rendering.",
      responses: {
        200: { description: "Full submodule hierarchy returned" },
      },
    },
  },
};
