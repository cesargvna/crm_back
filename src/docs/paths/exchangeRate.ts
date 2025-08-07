export const exchangeRatePaths = {
  // ✅ Crear una nueva tasa de cambio
  "POST: /product/exchangeRates": {
    post: {
      tags: ["ExchangeRate"],
      summary: "Create a new exchange rate",
      description: `
Creates a new exchange rate linked to specific currencies, tenant, and subsidiary.
- Ensures both currencies exist.
- Ensures no duplicate pair for the same subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "fromCurrencyId",
                "toCurrencyId",
                "rate",
                "tenantId",
                "subsidiaryId",
              ],
              properties: {
                fromCurrencyId: { type: "string", format: "uuid" },
                toCurrencyId: { type: "string", format: "uuid" },
                rate: {
                  type: "number",
                  format: "decimal",
                  example: 6.96,
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
          description: "Exchange rate created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Tasa de cambio creada correctamente.",
                exchangeRate: {
                  id: "uuid",
                  fromCurrencyId: "uuid",
                  toCurrencyId: "uuid",
                  rate: 6.96,
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2025-07-14T19:03:08.972Z",
                  updated_at: "2025-07-14T19:03:08.972Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "One or both currencies do not exist." },
        409: {
          description:
            "Exchange rate for this currency pair already exists in this subsidiary.",
        },
      },
    },
  },

  // ✅ Actualizar tasa de cambio existente
  "PUT: /product/exchangeRates/{id}": {
    put: {
      tags: ["ExchangeRate"],
      summary: "Update exchange rate",
      description: `
Updates the rate value for an existing exchange rate.
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
              required: ["rate"],
              properties: {
                rate: {
                  type: "number",
                  format: "decimal",
                  example: 7.05,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Exchange rate updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Tasa de cambio actualizada correctamente.",
                exchangeRate: {
                  id: "uuid",
                  fromCurrencyId: "uuid",
                  toCurrencyId: "uuid",
                  rate: 7.05,
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  created_at: "2025-07-14T19:03:08.972Z",
                  updated_at: "2025-07-15T10:30:12.456Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Exchange rate not found." },
      },
    },
  },

  // ✅ Obtener tasas por Subsidiary
  "GET: /product/exchangeRates/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["ExchangeRate"],
      summary: "Get exchange rates by subsidiary",
      description: `
Returns a list of exchange rates for a given subsidiary.
Includes currency details for both fromCurrency and toCurrency.
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
          description: "List of exchange rates for the subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 1,
                exchangeRates: [
                  {
                    id: "uuid",
                    fromCurrencyId: "uuid",
                    toCurrencyId: "uuid",
                    rate: 6.96,
                    tenantId: "uuid",
                    subsidiaryId: "uuid",
                    fromCurrency: {
                      id: "uuid",
                      code: "USD",
                      name: "Dólar americano",
                    },
                    toCurrency: {
                      id: "uuid",
                      code: "BOB",
                      name: "Boliviano",
                    },
                    created_at: "2025-07-14T19:03:08.972Z",
                    updated_at: "2025-07-14T19:03:08.972Z",
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

  // ✅ Obtener tasa por ID
  "GET: /product/exchangeRates/{id}": {
    get: {
      tags: ["ExchangeRate"],
      summary: "Get exchange rate by ID",
      description: `
Returns a single exchange rate by its ID, including details of both currencies.
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
          description: "Exchange rate retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                fromCurrencyId: "uuid",
                toCurrencyId: "uuid",
                rate: 6.96,
                tenantId: "uuid",
                subsidiaryId: "uuid",
                fromCurrency: {
                  id: "uuid",
                  code: "USD",
                  name: "Dólar americano",
                },
                toCurrency: {
                  id: "uuid",
                  code: "BOB",
                  name: "Boliviano",
                },
                created_at: "2025-07-14T19:03:08.972Z",
                updated_at: "2025-07-14T19:03:08.972Z",
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Exchange rate not found." },
      },
    },
  },
};
