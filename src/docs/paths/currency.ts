export const currencyPaths = {
  "POST: /product/currencies": {
    post: {
      tags: ["Currency"],
      summary: "Create a new currency",
      description: `
Creates a new currency linked to a specific subsidiary and tenant.  
- The \`name\` is normalized to lowercase, without accents, and "ñ" is converted to "n".  
- The \`code\` is uppercased automatically (e.g., USD, BOB).  
- \`name\` + \`code\` must be unique per subsidiary.  
- The subsidiary must exist and belong to the given tenant.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "code", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "Dólar Estadounidense" },
                code: { type: "string", example: "USD" },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Currency created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Currency created successfully.",
                currency: {
                  id: "uuid",
                  name: "dolar estadounidense",
                  code: "USD",
                  status: true,
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2024-07-10T12:00:00.000Z",
                  updated_at: "2024-07-10T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        409: { description: "Duplicate name and code for this subsidiary." },
      },
    },
  },

  "PUT: /product/currencies/{id}": {
    put: {
      tags: ["Currency"],
      summary: "Update currency",
      description: `
Updates the \`name\` or \`code\` of a currency.  
- Both fields are normalized (name lowercased, accents removed; code uppercased).  
- Cannot update tenantId or subsidiaryId.  
- If either field changes, uniqueness is re-validated within the same subsidiary.
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
                name: { type: "string", example: "Boliviano" },
                code: { type: "string", example: "BOB" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Currency updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Currency updated successfully.",
                currency: {
                  id: "uuid",
                  name: "boliviano",
                  code: "BOB",
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "Currency not found." },
        409: { description: "Duplicate name and code for this subsidiary." },
      },
    },
  },

  "GET: /product/currencies/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Currency"],
      summary: "Get currencies by subsidiary",
      description: `
Returns a paginated list of currencies for the given subsidiary.  
Supports search by \`name\` or \`code\` and filtering by \`status\`.
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
          schema: { type: "string", enum: ["true", "false"], example: "true" },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5 } },
      ],
      responses: {
        200: {
          description: "List of currencies.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                currencies: [
                  {
                    id: "uuid",
                    name: "dolar estadounidense",
                    code: "USD",
                    status: true,
                  },
                  {
                    id: "uuid",
                    name: "boliviano",
                    code: "BOB",
                    status: true,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /product/currenciesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Currency"],
      summary: "Get active currencies by subsidiary",
      description: `
Returns only active currencies for the given subsidiary.
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
          description: "List of active currencies.",
          content: {
            "application/json": {
              example: {
                total: 1,
                currencies: [
                  {
                    id: "uuid",
                    name: "dolar estadounidense",
                    code: "USD",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /product/currencies/{id}": {
    get: {
      tags: ["Currency"],
      summary: "Get currency by ID",
      description: `
Returns a currency by its ID.
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
          description: "Currency retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "dolar estadounidense",
                code: "USD",
                status: true,
                tenantId: "uuid",
                subsidiaryId: "uuid",
              },
            },
          },
        },
        404: { description: "Currency not found." },
      },
    },
  },

  "PATCH: /product/currencies/{id}/status": {
    patch: {
      tags: ["Currency"],
      summary: "Toggle currency status",
      description: `
Toggles the \`status\` of a currency between active and inactive.
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
          description: "Currency status updated.",
          content: {
            "application/json": {
              example: {
                message: "Currency status changed to inactive.",
                currency: {
                  id: "uuid",
                  name: "dolar estadounidense",
                  code: "USD",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Currency not found." },
      },
    },
  },
};
