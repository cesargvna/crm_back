export const expensePaths = {
  "POST: /expense": {
    post: {
      tags: ["Expense"],
      summary: "Create a new expense",
      description: `
Creates a new expense linked to a valid expense category and user.
- The \`name\` is normalized to lowercase, without accents, and trimmed.
- \`total_amount\` is NOT accepted in the request body; it is always calculated as \`quantity * unit_price\` on the server.
- Expense category must belong to the same Tenant and Subsidiary.
- User must exist.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "name",
                "quantity",
                "unit_price",
                "expenseCategoryId",
                "userId",
                "tenantId",
                "subsidiaryId",
              ],
              properties: {
                name: { type: "string", example: "pago luz julio" },
                description: {
                  type: "string",
                  example: "Factura eléctrica CFE Julio",
                },
                quantity: { type: "integer", example: 1 },
                unit_price: {
                  type: "number",
                  format: "decimal",
                  example: 500.0,
                },
                expenseCategoryId: { type: "string", format: "uuid" },
                userId: { type: "string", format: "uuid" },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Expense created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Expense created successfully.",
                expense: {
                  id: "uuid",
                  name: "pago luz julio",
                  description: "Factura eléctrica CFE Julio",
                  quantity: 1,
                  unit_price: 500.0,
                  total_amount: 500.0,
                  expenseCategoryId: "uuid",
                  userId: "uuid",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2024-07-08T12:00:00.000Z",
                  updated_at: "2024-07-08T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error or ExpenseCategory does not belong to specified Tenant/Subsidiary.",
        },
        404: { description: "Expense category or User not found." },
      },
    },
  },

  "PUT: /expense/{id}": {
    put: {
      tags: ["Expense"],
      summary: "Update an expense",
      description: `
Updates an existing expense.
- Only updates fields provided.
- If \`quantity\` or \`unit_price\` change, \`total_amount\` is recalculated automatically.
- \`total_amount\` is NOT accepted in the request body.
- If \`expenseCategoryId\` is changed, it must exist.
- \`tenantId\` and \`subsidiaryId\` cannot be changed.
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
                name: { type: "string", example: "pago luz agosto" },
                description: {
                  type: "string",
                  example: "Factura actualizada de luz agosto",
                },
                quantity: { type: "integer", example: 1 },
                unit_price: {
                  type: "number",
                  format: "decimal",
                  example: 520.0,
                },
                expenseCategoryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Expense updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Expense updated successfully.",
                expense: {
                  id: "uuid",
                  name: "pago luz agosto",
                  description: "Factura actualizada de luz agosto",
                  quantity: 1,
                  unit_price: 520.0,
                  total_amount: 520.0,
                  expenseCategoryId: "uuid",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2024-07-08T12:00:00.000Z",
                  updated_at: "2024-07-09T10:00:00.000Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Expense or ExpenseCategory not found." },
      },
    },
  },

  "GET: /expense/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Expense"],
      summary: "List expenses by subsidiary",
      description: `
Returns a paginated list of expenses for a given subsidiary.
Supports search by name or description, and filtering by ExpenseCategory.
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
          name: "expenseCategoryId",
          in: "query",
          schema: { type: "string", format: "uuid" },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 5, maximum: 1000 },
        },
      ],
      responses: {
        200: {
          description: "Paginated list of expenses.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                data: [
                  {
                    id: "uuid",
                    name: "pago luz julio",
                    quantity: 1,
                    unit_price: 500.0,
                    total_amount: 500.0,
                    expenseCategory: {
                      id: "uuid",
                      name: "servicios basicos",
                    },
                    user: {
                      id: "uuid",
                      name: "Juan",
                    },
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

  "GET: /expense/{id}": {
    get: {
      tags: ["Expense"],
      summary: "Get expense by ID",
      description: `
Returns a single expense by its ID, including related ExpenseCategory and User.
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
          description: "Expense found.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "pago luz julio",
                description: "Factura CFE Julio",
                quantity: 1,
                unit_price: 500.0,
                total_amount: 500.0,
                expenseCategory: {
                  id: "uuid",
                  name: "servicios basicos",
                },
                user: {
                  id: "uuid",
                  name: "Juan",
                  username: "juan.perez",
                  email: "juan@example.com",
                },
                tenantId: "uuid",
                subsidiaryId: "uuid",
                created_at: "2024-07-08T12:00:00.000Z",
                updated_at: "2024-07-08T12:00:00.000Z",
              },
            },
          },
        },
        404: { description: "Expense not found." },
      },
    },
  },
};
                                                                                                       