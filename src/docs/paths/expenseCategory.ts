export const expenseCategoryPaths = {
  "POST: /expense/categories": {
    post: {
      tags: ["Expense Category"],
      summary: "Create a new expense category",
      description: `
Creates a new expense category for a subsidiary.  
- The \`name\` is normalized: lowercase, no accents, no "ñ" (converted to "n").  
- The \`Subsidiary\` must exist and belong to the specified \`Tenant\`.  
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
                name: { type: "string", example: "alimentacion" },
                description: {
                  type: "string",
                  example: "Gastos relacionados a alimentos",
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
          description: "Expense category created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Expense category created successfully.",
                category: {
                  id: "uuid",
                  name: "alimentacion",
                  description: "Gastos relacionados a alimentos",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                  created_at: "2024-06-01T12:34:56.000Z",
                  updated_at: "2024-06-01T12:34:56.000Z",
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
        409: { description: "Expense category with this name already exists." },
      },
    },
  },

  "PUT: /expense/categories/{id}": {
    put: {
      tags: ["Expense Category"],
      summary: "Update an expense category",
      description: `
Updates the \`name\` and/or \`description\` of an expense category.  
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
                name: { type: "string", example: "alimentacion general" },
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
          description: "Expense category updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Expense category updated successfully.",
                category: {
                  id: "uuid",
                  name: "alimentacion general",
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
        404: { description: "Expense category not found." },
        409: { description: "Another category with this name already exists." },
      },
    },
  },

  "PATCH: /expense/categories/{id}/status": {
    patch: {
      tags: ["Expense Category"],
      summary: "Toggle expense category status",
      description: `
Activates or deactivates an expense category.  
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
          description: "Expense category status changed.",
          content: {
            "application/json": {
              example: {
                message: "Expense category status changed to inactive.",
                category: {
                  id: "uuid",
                  name: "alimentacion general",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Expense category not found." },
      },
    },
  },

  "GET: /expense/categories/{id}": {
    get: {
      tags: ["Expense Category"],
      summary: "Get expense category by ID",
      description: `
Returns an expense category by its unique ID.
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
          description: "Expense category retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "alimentacion",
                description: "Gastos relacionados a alimentos",
                tenantId: "uuid",
                subsidiaryId: "uuid",
                status: true,
              },
            },
          },
        },
        404: { description: "Expense category not found." },
      },
    },
  },

  "GET: /expense/categories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Expense Category"],
      summary: "Get expense categories by subsidiary",
      description: `
Returns a paginated list of expense categories for a given subsidiary.  
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
          description: "List of expense categories by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                categories: [
                  {
                    id: "uuid",
                    name: "alimentacion",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "transporte",
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
