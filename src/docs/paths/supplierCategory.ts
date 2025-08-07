export const supplierCategoryPaths = {
  "POST: /supplier/categories": {
    post: {
      tags: ["SupplierCategory"],
      summary: "Create a new Supplier Category",
      description: `
Creates a new supplier category for a given Tenant and Subsidiary.
- The \`name\` is normalized to lowercase, without accents, and trimmed.
- Name must be unique within the same Tenant/Subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "materiales construcción" },
                description: {
                  type: "string",
                  example: "Proveedores de materiales de obra",
                },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Supplier category created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Supplier category created successfully.",
                category: {
                  id: "uuid",
                  name: "materiales construcción",
                  description: "Proveedores de materiales de obra",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                  created_at: "2024-07-11T12:00:00.000Z",
                  updated_at: "2024-07-11T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error or Subsidiary does not belong to Tenant.",
        },
        409: { description: "A Supplier Category with this name already exists." },
      },
    },
  },

  "PUT: /supplier/categories/{id}": {
    put: {
      tags: ["SupplierCategory"],
      summary: "Update a Supplier Category",
      description: `
Updates an existing supplier category.
- Only updates fields provided.
- Validates that the new name is unique within Tenant/Subsidiary.
      `,
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
              properties: {
                name: { type: "string", example: "materiales terminados" },
                description: {
                  type: "string",
                  example: "Proveedores de materiales de acabados",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Supplier category updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Supplier category updated successfully.",
                category: {
                  id: "uuid",
                  name: "materiales terminados",
                  description: "Proveedores de materiales de acabados",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                  created_at: "2024-07-11T12:00:00.000Z",
                  updated_at: "2024-07-11T13:00:00.000Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Supplier category not found." },
        409: {
          description: "Another Supplier Category with this name already exists.",
        },
      },
    },
  },

  "GET: /supplier/categories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["SupplierCategory"],
      summary: "List Supplier Categories by Subsidiary",
      description: `
Returns a paginated list of supplier categories for a given subsidiary.
Supports search by name or description, and status filter.
      `,
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { type: "boolean" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5 } },
      ],
      responses: {
        200: {
          description: "Paginated list of supplier categories.",
          content: {
            "application/json": {
              example: {
                total: 1,
                page: 1,
                limit: 5,
                totalPages: 1,
                categories: [
                  {
                    id: "uuid",
                    name: "materiales construcción",
                    description: "Proveedores de materiales de obra",
                    status: true,
                  },
                ],
              },
            },
          },
        },
        400: { description: "Validation error." },
      },
    },
  },

  "GET: /supplier/categories/{id}": {
    get: {
      tags: ["SupplierCategory"],
      summary: "Get Supplier Category by ID",
      description: `Returns a single supplier category by its ID.`,
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
          description: "Supplier category found.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "materiales construcción",
                description: "Proveedores de materiales de obra",
                tenantId: "uuid",
                subsidiaryId: "uuid",
                status: true,
                created_at: "2024-07-11T12:00:00.000Z",
                updated_at: "2024-07-11T12:00:00.000Z",
              },
            },
          },
        },
        404: { description: "Supplier category not found." },
      },
    },
  },

  "PATCH: /supplier/categories/{id}/status": {
    patch: {
      tags: ["SupplierCategory"],
      summary: "Toggle Supplier Category status",
      description: `
Toggles the status (active/inactive) of a supplier category.
Automatically deactivates or reactivates all related suppliers.
      `,
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
          description: "Supplier category status changed successfully.",
          content: {
            "application/json": {
              example: {
                message:
                  "Supplier category status changed to inactive, and all related suppliers have been deactivated.",
                category: {
                  id: "uuid",
                  name: "materiales construcción",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Supplier category not found." },
      },
    },
  },

  "GET: /supplier/categoriesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["SupplierCategory"],
      summary: "List active Supplier Categories by Subsidiary",
      description: `
Returns all active supplier categories for a given subsidiary.
      `,
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "List of active supplier categories.",
          content: {
            "application/json": {
              example: {
                total: 2,
                categories: [
                  {
                    id: "uuid",
                    name: "materiales construcción",
                    description: "Proveedores de materiales de obra",
                  },
                  {
                    id: "uuid",
                    name: "acabados",
                    description: "Proveedores de materiales de acabado",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /supplier/allCategories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["SupplierCategory"],
      summary: "List all Supplier Categories by Subsidiary",
      description: `
Returns all supplier categories (active or inactive) for a given subsidiary.
No filters, no pagination.
      `,
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "List of all supplier categories.",
          content: {
            "application/json": {
              example: {
                total: 2,
                categories: [
                  {
                    id: "uuid",
                    name: "materiales construcción",
                    description: "Proveedores de materiales de obra",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "acabados",
                    description: "Proveedores de materiales de acabado",
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
};
