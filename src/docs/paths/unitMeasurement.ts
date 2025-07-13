export const unitMeasurementPaths = {
  "POST: /product/unitMeasurements": {
    post: {
      tags: ["UnitMeasurement"],
      summary: "Create a new unit measurement",
      description: `
Creates a new unit measurement for a given subsidiary and tenant.
- The \`name\` is normalized to lowercase, accents removed, "ñ" replaced with "n".
- The name must be unique within the same subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "quantity", "tenantId", "subsidiaryId"],
              properties: {
                name: { type: "string", example: "Kilogram" },
                quantity: { type: "integer", example: 1 },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Unit measurement created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Unit measurement created successfully.",
                unitMeasurement: {
                  id: "uuid",
                  name: "kilogram",
                  quantity: 1,
                  status: true,
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        409: { description: "A unit measurement with this name already exists for this subsidiary." },
      },
    },
  },

  "PUT: /product/unitMeasurements/{id}": {
    put: {
      tags: ["UnitMeasurement"],
      summary: "Update unit measurement",
      description: `
Updates the \`name\` and/or \`quantity\` of a unit measurement.
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
                name: { type: "string", example: "Kilogram Pack" },
                quantity: { type: "integer", example: 10 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Unit measurement updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Unit measurement updated successfully.",
                unitMeasurement: {
                  id: "uuid",
                  name: "kilogram pack",
                  quantity: 10,
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "Unit measurement not found." },
        409: { description: "Another unit measurement with this name already exists for this subsidiary." },
      },
    },
  },

  "GET: /product/unitMeasurements/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["UnitMeasurement"],
      summary: "Get unit measurements by subsidiary",
      description: `
Returns a paginated list of unit measurements for the given subsidiary.
Supports search in \`name\` and filtering by \`status\`.
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
          description: "List of unit measurements.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                units: [
                  {
                    id: "uuid",
                    name: "kilogram",
                    quantity: 1,
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

  "GET: /product/unitMeasurementsActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["UnitMeasurement"],
      summary: "Get active unit measurements by subsidiary",
      description: `
Returns only active unit measurements for the given subsidiary.
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
          description: "List of active unit measurements.",
          content: {
            "application/json": {
              example: {
                total: 1,
                units: [
                  {
                    id: "uuid",
                    name: "kilogram",
                    quantity: 1,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /product/unitMeasurements/{id}": {
    get: {
      tags: ["UnitMeasurement"],
      summary: "Get unit measurement by ID",
      description: `
Returns a unit measurement by its ID.
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
          description: "Unit measurement retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "kilogram",
                quantity: 1,
                status: true,
                tenantId: "uuid",
                subsidiaryId: "uuid",
              },
            },
          },
        },
        404: { description: "Unit measurement not found." },
      },
    },
  },

  "PATCH: /product/unitMeasurements/{id}/status": {
    patch: {
      tags: ["UnitMeasurement"],
      summary: "Toggle unit measurement status",
      description: `
Toggles the \`status\` of a unit measurement between active and inactive.
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
          description: "Unit measurement status updated.",
          content: {
            "application/json": {
              example: {
                message: "Unit measurement status changed to inactive.",
                unitMeasurement: {
                  id: "uuid",
                  name: "kilogram",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Unit measurement not found." },
      },
    },
  },
};
