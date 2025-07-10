export const incomeCategoryPaths = {
  "POST: /income/categories": {
    post: {
      tags: ["Income Category"],
      summary: "Create a new income category",
      description: `
Creates a new income category for a subsidiary.
- The \`name\` is normalized: lowercase, no accents, no "ñ" (converted to "n").
- The Subsidiary must exist and belong to the specified Tenant.
- Name must be unique within the same Tenant and Subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "venta activos" },
                description: {
                  type: "string",
                  example: "Ingresos por venta de activos fijos",
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
          description: "Income category created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Income category created successfully.",
                category: {
                  id: "uuid",
                  name: "venta activos",
                  description: "Ingresos por venta de activos fijos",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                  created_at: "2024-07-10T12:00:00.000Z",
                  updated_at: "2024-07-10T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error or Subsidiary does not belong to Tenant.",
        },
        404: { description: "Subsidiary not found." },
        409: {
          description:
            "An income category with this name already exists for this tenant and subsidiary.",
        },
      },
    },
  },

  "PUT: /income/categories/{id}": {
    put: {
      tags: ["Income Category"],
      summary: "Update an income category",
      description: `
Updates the \`name\` and/or \`description\` of an income category.
- The \`tenantId\` and \`subsidiaryId\` cannot be changed.
- The \`name\` is normalized before saving.
- Prevents duplicate names within the same Tenant and Subsidiary.
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
                name: { type: "string", example: "venta activos fijos" },
                description: {
                  type: "string",
                  example: "Descripción actualizada",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Income category updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Income category updated successfully.",
                category: {
                  id: "uuid",
                  name: "venta activos fijos",
                  description: "Descripción actualizada",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Income category not found." },
        409: {
          description:
            "Another income category with this name already exists for this tenant and subsidiary.",
        },
      },
    },
  },

  "PATCH: /income/categories/{id}/status": {
    patch: {
      tags: ["Income Category"],
      summary: "Toggle income category status",
      description: `
Activates or deactivates an income category.
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
          description: "Income category status changed.",
          content: {
            "application/json": {
              example: {
                message: "Income category status changed to inactive.",
                category: {
                  id: "uuid",
                  name: "venta activos fijos",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Income category not found." },
      },
    },
  },

  "GET: /income/categories/{id}": {
    get: {
      tags: ["Income Category"],
      summary: "Get income category by ID",
      description: `
Returns an income category by its unique ID.
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
          description: "Income category retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "venta activos",
                description: "Ingresos por venta de activos fijos",
                tenantId: "uuid",
                subsidiaryId: "uuid",
                status: true,
              },
            },
          },
        },
        404: { description: "Income category not found." },
      },
    },
  },

  "GET: /income/categories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Income Category"],
      summary: "Get income categories by subsidiary",
      description: `
Returns a paginated list of income categories for a given subsidiary.
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
          description: "List of income categories by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                categories: [
                  {
                    id: "uuid",
                    name: "venta activos",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "servicios extraordinarios",
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

  "GET: /income/categoriesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Income Category"],
      summary: "Get active income categories by subsidiary",
      description: `
Returns only active income categories for a given subsidiary.
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
          description: "List of active income categories.",
          content: {
            "application/json": {
              example: {
                total: 1,
                categories: [
                  {
                    id: "uuid",
                    name: "venta activos",
                    description: "Ingresos por venta de activos",
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
