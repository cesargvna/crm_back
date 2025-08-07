export const productPaths = {
  "POST: /product/products": {
    post: {
      tags: ["Product"],
      summary: "Create a new product",
      description: `
Creates a new product for a subsidiary.
- The \`name\` is normalized (removes accents, "ñ" to "n", trims spaces).
- The \`code\` is uppercased.
- Ensures uniqueness of code+name within the same tenant and subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "code",
                "name",
                "productCategoryId",
                "unitMeasurementId",
                "tenantId",
                "subsidiaryId",
              ],
              properties: {
                code: { type: "string", example: "PROD-001" },
                barcode: { type: "string", example: "1234567890123" },
                name: { type: "string", example: "Leche Pasteurizada" },
                description: {
                  type: "string",
                  example: "Producto lácteo refrigerado",
                },
                productCategoryId: { type: "string", format: "uuid" },
                unitMeasurementId: { type: "string", format: "uuid" },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Product created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Product created successfully.",
                product: {
                  id: "uuid",
                  code: "PROD-001",
                  barcode: "1234567890123",
                  name: "Leche Pasteurizada",
                  description: "Producto lácteo refrigerado",
                  productCategoryId: "uuid",
                  unitMeasurementId: "uuid",
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
        400: { description: "Validation error." },
        409: {
          description: "A product with this code and name already exists for this tenant and subsidiary.",
        },
      },
    },
  },

  "PUT: /product/products/{id}": {
    put: {
      tags: ["Product"],
      summary: "Update a product",
      description: `
Updates product fields.
- The \`name\` and \`code\` are normalized.
- Validates duplicate (code+name) in the same tenant+subsidiary.
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
                code: { type: "string", example: "PROD-002" },
                barcode: { type: "string", example: "9876543210987" },
                name: { type: "string", example: "Leche Descremada" },
                description: {
                  type: "string",
                  example: "Actualización de descripción",
                },
                productCategoryId: { type: "string", format: "uuid" },
                unitMeasurementId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Product updated successfully.",
                product: {
                  id: "uuid",
                  code: "PROD-002",
                  barcode: "9876543210987",
                  name: "Leche Descremada",
                  description: "Actualización de descripción",
                  productCategoryId: "uuid",
                  unitMeasurementId: "uuid",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Product not found." },
        409: {
          description: "Another product with this code and name already exists for this tenant and subsidiary.",
        },
      },
    },
  },

  "PATCH: /product/products/{id}/status": {
    patch: {
      tags: ["Product"],
      summary: "Toggle product status",
      description: `
Activates or deactivates a product.
Flips the current \`status\`.
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
          description: "Product status changed.",
          content: {
            "application/json": {
              example: {
                message: "Product status changed to inactive.",
                product: {
                  id: "uuid",
                  code: "PROD-001",
                  name: "Leche Pasteurizada",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Product not found." },
      },
    },
  },

  "GET: /product/products/{id}": {
    get: {
      tags: ["Product"],
      summary: "Get product by ID",
      description: `
Returns a product by its unique ID.
Includes product category and unit measurement.
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
          description: "Product retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                code: "PROD-001",
                barcode: "1234567890123",
                name: "Leche Pasteurizada",
                description: "Producto lácteo refrigerado",
                productCategory: {
                  id: "uuid",
                  name: "Lácteos",
                },
                unitMeasurement: {
                  id: "uuid",
                  name: "Litro",
                  quantity: 1,
                },
                status: true,
              },
            },
          },
        },
        404: { description: "Product not found." },
      },
    },
  },

  "GET: /product/products/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Product"],
      summary: "Get products by subsidiary",
      description: `
Returns a paginated list of products for a given subsidiary.
Supports search by name, code, barcode, and filtering by status.
Includes category and unit measurement.
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
          schema: { type: "integer", default: 10, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description: "List of products by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 10,
                products: [
                  {
                    id: "uuid",
                    code: "PROD-001",
                    name: "Leche Pasteurizada",
                    status: true,
                  },
                  {
                    id: "uuid",
                    code: "PROD-002",
                    name: "Leche Descremada",
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

  "GET: /product/productsActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Product"],
      summary: "Get active products by subsidiary",
      description: `
Returns only active products for a given subsidiary.
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
          description: "List of active products.",
          content: {
            "application/json": {
              example: {
                total: 1,
                products: [
                  {
                    id: "uuid",
                    code: "PROD-001",
                    name: "Leche Pasteurizada",
                    barcode: "1234567890123",
                    description: "Producto lácteo refrigerado",
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
