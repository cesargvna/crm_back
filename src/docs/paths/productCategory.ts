export const productCategoryPaths = {
  "POST: /product/categories": {
    post: {
      tags: ["Product Category"],
      summary: "Create a new product category",
      description: `
Creates a new product category for a subsidiary.
- The \`name\` is normalized: lowercase, no accents, no "ñ" (converted to "n").
- Name must be unique within the same Subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "Lácteos" },
                description: {
                  type: "string",
                  example: "Categoría para productos lácteos",
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
          description: "Product category created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Product category created successfully.",
                productCategory: {
                  id: "uuid",
                  name: "Lacteos",
                  description: "Categoría para productos lácteos",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                  created_at: "2025-07-12T12:00:00.000Z",
                  updated_at: "2025-07-12T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "Validation error.",
        },
        409: {
          description:
            "A product category with this name already exists for this subsidiary.",
        },
      },
    },
  },

  "PUT: /product/categories/{id}": {
    put: {
      tags: ["Product Category"],
      summary: "Update a product category",
      description: `
Updates the \`name\` and/or \`description\` of a product category.
- The \`tenantId\` and \`subsidiaryId\` cannot be changed.
- The \`name\` is normalized before saving.
- Prevents duplicate names within the same Subsidiary.
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
                name: { type: "string", example: "Lácteos pasteurizados" },
                description: {
                  type: "string",
                  example: "Actualización de la descripción",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Product category updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Product category updated successfully.",
                productCategory: {
                  id: "uuid",
                  name: "Lacteos pasteurizados",
                  description: "Actualización de la descripción",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Product category not found." },
        409: {
          description:
            "Another product category with this name already exists for this subsidiary.",
        },
      },
    },
  },

  "PATCH: /product/categories/{id}/status": {
    patch: {
      tags: ["Product Category"],
      summary: "Toggle product category status",
      description: `
Activates or deactivates a product category.
- Flips the current \`status\` (true/false).
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
          description: "Product category status changed.",
          content: {
            "application/json": {
              example: {
                message: "Product category status changed to inactive.",
                productCategory: {
                  id: "uuid",
                  name: "Lacteos",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Product category not found." },
      },
    },
  },

  "GET: /product/categories/{id}": {
    get: {
      tags: ["Product Category"],
      summary: "Get product category by ID",
      description: `
Returns a product category by its unique ID.
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
          description: "Product category retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "Lacteos",
                description: "Categoría para productos lácteos",
                tenantId: "uuid",
                subsidiaryId: "uuid",
                status: true,
              },
            },
          },
        },
        404: { description: "Product category not found." },
      },
    },
  },

  "GET: /product/categories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Product Category"],
      summary: "Get product categories by subsidiary",
      description: `
Returns a paginated list of product categories for a given subsidiary.
Supports search by name and filtering by status.
      `,
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        { name: "search", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["true", "false", "all"],
            default: "all",
          },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 5, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description: "List of product categories by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                categories: [
                  {
                    id: "uuid",
                    name: "Lacteos",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "Embutidos",
                    status: false,
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

  "GET: /product/categoriesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Product Category"],
      summary: "Get active product categories by subsidiary",
      description: `
Returns only active product categories for a given subsidiary.
No pagination is applied.
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
          description: "List of active product categories.",
          content: {
            "application/json": {
              example: {
                total: 1,
                categories: [
                  {
                    id: "uuid",
                    name: "Lacteos",
                    description: "Categoría para productos lácteos",
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
  
  "GET: /product/allCategories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Product Category"],
      summary: "Get ALL product categories by subsidiary",
      description: `
Returns all product categories for a given subsidiary, without pagination.
Includes active and inactive categories.
Useful for dropdowns, reports, or complete listings.
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
          description: "List of all product categories.",
          content: {
            "application/json": {
              example: {
                total: 2,
                categories: [
                  {
                    id: "uuid",
                    name: "Lacteos",
                    description: "Categoría para productos lácteos",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "Embutidos",
                    description: "Carnes procesadas",
                    status: false,
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
};
