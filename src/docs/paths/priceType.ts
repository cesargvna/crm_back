export const priceTypePaths = {
  "POST: /product/priceTypes": {
    post: {
      tags: ["PriceType"],
      summary: "Create a new price type",
      description: `
Creates a new price type linked to a specific subsidiary and tenant.
- The \`name\` is normalized to lowercase, accents are removed, and "ñ" is converted to "n".
- \`name\` must be unique per subsidiary.
- The subsidiary must exist and belong to the given tenant.
- \`marginPercent\` is required and defines the percentage profit margin.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "marginPercent", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "Mayorista" },
                marginPercent: { type: "number", example: 25.5 },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Price type created successfully.",
          content: {
            "application/json": {
              example: {
                message: "PriceType created successfully.",
                priceType: {
                  id: "uuid",
                  name: "mayorista",
                  status: true,
                  marginPercent: 25.5,
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
        409: { description: "Duplicate name for this subsidiary." },
      },
    },
  },

  "PUT: /product/priceTypes/{id}": {
    put: {
      tags: ["PriceType"],
      summary: "Update a price type",
      description: `
Updates the name and/or \`marginPercent\` of a price type.
- The \`name\` is normalized if provided.
- Cannot update tenantId or subsidiaryId.
- If the name changes, uniqueness is re-validated within the same subsidiary.
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
                name: { type: "string", example: "Minorista actualizado" },
                marginPercent: { type: "number", example: 35.0 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Price type updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "PriceType updated successfully.",
                priceType: {
                  id: "uuid",
                  name: "minorista actualizado",
                  status: true,
                  marginPercent: 35.0,
                },
              },
            },
          },
        },
        404: { description: "PriceType not found." },
        409: { description: "Duplicate name for this subsidiary." },
      },
    },
  },

  "GET: /product/priceTypes/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["PriceType"],
      summary: "Get price types by subsidiary",
      description: `
Returns a paginated list of price types for the given subsidiary.
Supports search by \`name\` and filtering by \`status\`.
Includes \`marginPercent\` for each type.
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
          description: "List of price types.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                priceTypes: [
                  {
                    id: "uuid",
                    name: "mayorista",
                    status: true,
                    marginPercent: 25.5,
                  },
                  {
                    id: "uuid",
                    name: "minorista",
                    status: true,
                    marginPercent: 35.0,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /product/priceTypesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["PriceType"],
      summary: "Get active price types by subsidiary",
      description: `
Returns only active price types for the given subsidiary, including their \`marginPercent\`.
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
          description: "List of active price types.",
          content: {
            "application/json": {
              example: {
                total: 1,
                priceTypes: [
                  {
                    id: "uuid",
                    name: "mayorista",
                    marginPercent: 25.5,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /product/priceTypes/{id}": {
    get: {
      tags: ["PriceType"],
      summary: "Get price type by ID",
      description: `
Returns a price type by its ID, including its \`marginPercent\`.
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
          description: "Price type retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "mayorista",
                status: true,
                marginPercent: 25.5,
                tenantId: "uuid",
                subsidiaryId: "uuid",
              },
            },
          },
        },
        404: { description: "PriceType not found." },
      },
    },
  },

  "PATCH: /product/priceTypes/{id}/status": {
    patch: {
      tags: ["PriceType"],
      summary: "Toggle price type status",
      description: `
Toggles the \`status\` of a price type between active and inactive.
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
          description: "Price type status updated.",
          content: {
            "application/json": {
              example: {
                message: "PriceType status changed to inactive.",
                priceType: {
                  id: "uuid",
                  name: "mayorista",
                  status: false,
                  marginPercent: 25.5,
                },
              },
            },
          },
        },
        404: { description: "PriceType not found." },
      },
    },
  },
};
