export const incomePaths = {
  "POST: /income": {
    post: {
      tags: ["Income"],
      summary: "Create a new income",
      description: `
Creates a new income linked to a valid income category and user.
- The \`name\` is normalized to lowercase, without accents, and trimmed.
- \`total_amount\` is NOT accepted in the request body; it is always calculated as \`quantity * unit_price\` on the server.
- Income category must belong to the same Tenant and Subsidiary.
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
                "incomeCategoryId",
                "userId",
                "tenantId",
                "subsidiaryId",
              ],
              properties: {
                name: { type: "string", example: "venta activos julio" },
                description: {
                  type: "string",
                  example: "Venta de escritorio antiguo Julio",
                },
                quantity: { type: "integer", example: 1 },
                unit_price: {
                  type: "number",
                  format: "decimal",
                  example: 800.0,
                },
                incomeCategoryId: { type: "string", format: "uuid" },
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
          description: "Income created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Income created successfully.",
                income: {
                  id: "uuid",
                  name: "venta activos julio",
                  description: "Venta de escritorio antiguo Julio",
                  quantity: 1,
                  unit_price: 800.0,
                  total_amount: 800.0,
                  incomeCategoryId: "uuid",
                  userId: "uuid",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2024-07-10T12:00:00.000Z",
                  updated_at: "2024-07-10T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error or IncomeCategory does not belong to specified Tenant/Subsidiary.",
        },
        404: { description: "Income category or User not found." },
      },
    },
  },

  "PUT: /income/{id}": {
    put: {
      tags: ["Income"],
      summary: "Update an income",
      description: `
Updates an existing income.
- Only updates fields provided.
- If \`quantity\` or \`unit_price\` change, \`total_amount\` is recalculated automatically.
- \`total_amount\` is NOT accepted in the request body.
- If \`incomeCategoryId\` is changed, it must exist.
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
                name: { type: "string", example: "venta activos agosto" },
                description: {
                  type: "string",
                  example: "Venta actualizada escritorio Agosto",
                },
                quantity: { type: "integer", example: 1 },
                unit_price: {
                  type: "number",
                  format: "decimal",
                  example: 900.0,
                },
                incomeCategoryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Income updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Income updated successfully.",
                income: {
                  id: "uuid",
                  name: "venta activos agosto",
                  description: "Venta actualizada escritorio Agosto",
                  quantity: 1,
                  unit_price: 900.0,
                  total_amount: 900.0,
                  incomeCategoryId: "uuid",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2024-07-10T12:00:00.000Z",
                  updated_at: "2024-07-11T10:00:00.000Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Income or IncomeCategory not found." },
      },
    },
  },

  "GET: /income/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Income"],
      summary: "List incomes by subsidiary",
      description: `
Returns a paginated list of incomes for a given subsidiary.
Supports search by name or description, and filtering by IncomeCategory.
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
          name: "incomeCategoryId",
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
          description: "Paginated list of incomes.",
          content: {
            "application/json": {
              example: {
                total: 1,
                page: 1,
                limit: 5,
                totalPages: 1,
                data: [
                  {
                    id: "uuid",
                    name: "venta activos julio",
                    quantity: 1,
                    unit_price: 800.0,
                    total_amount: 800.0,
                    incomecategory: {
                      id: "uuid",
                      name: "ventas extraordinarias",
                    },
                    user: {
                      id: "uuid",
                      name: "Ana",
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

  "GET: /income/{id}": {
    get: {
      tags: ["Income"],
      summary: "Get income by ID",
      description: `
Returns a single income by its ID, including related IncomeCategory and User.
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
          description: "Income found.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "venta activos julio",
                description: "Venta de escritorio antiguo Julio",
                quantity: 1,
                unit_price: 800.0,
                total_amount: 800.0,
                incomecategory: {
                  id: "uuid",
                  name: "ventas extraordinarias",
                },
                user: {
                  id: "uuid",
                  name: "Ana",
                  username: "ana.fernandez",
                  email: "ana@example.com",
                },
                tenantId: "uuid",
                subsidiaryId: "uuid",
                created_at: "2024-07-10T12:00:00.000Z",
                updated_at: "2024-07-10T12:00:00.000Z",
              },
            },
          },
        },
        404: { description: "Income not found." },
      },
    },
  },
};
