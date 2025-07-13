export const priceTypePaths = {
  "POST: /product/priceTypes": {
    post: {
      tags: ["PriceType"],
      summary: "Create a new price type",
      description: `
Creates a new price type linked to a specific subsidiary and tenant.  
- The \`name\` is normalized to lowercase, without accents, and "ñ" is converted to "n".  
- \`name\` must be unique per subsidiary.  
- The subsidiary must exist and belong to the given tenant.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "Mayorista" },
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
                message: "Price type created successfully.",
                priceType: {
                  id: "uuid",
                  name: "mayorista",
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
        409: { description: "Duplicate name for this subsidiary." },
      },
    },
  },

  "PUT: /product/priceTypes/{id}": {
    put: {
      tags: ["PriceType"],
      summary: "Update price type",
      description: `
Updates the name of a price type.  
- The \`name\` is normalized.  
- Cannot update tenantId or subsidiaryId.
- If name changes, uniqueness is re-validated within the same subsidiary.
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
                message: "Price type updated successfully.",
                priceType: {
                  id: "uuid",
                  name: "minorista actualizado",
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "Price type not found." },
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
                  },
                  {
                    id: "uuid",
                    name: "minorista",
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

  "GET: /product/priceTypesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["PriceType"],
      summary: "Get active price types by subsidiary",
      description: `
Returns only active price types for the given subsidiary.
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
Returns a price type by its ID.
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
                tenantId: "uuid",
                subsidiaryId: "uuid",
              },
            },
          },
        },
        404: { description: "Price type not found." },
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
                message: "Price type status changed to inactive.",
                priceType: {
                  id: "uuid",
                  name: "mayorista",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Price type not found." },
      },
    },
  },
};
