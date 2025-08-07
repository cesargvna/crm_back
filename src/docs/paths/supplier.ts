export const supplierPaths = {
  "POST: /supplier": {
    post: {
      tags: ["Supplier"],
      summary: "Create a new Supplier",
      description: `
Creates a new supplier linked to a valid Supplier Category.
- The \`name\` is normalized to remove accents and spaces.
- Supplier Category must belong to the same Tenant/Subsidiary.
- Supplier name must be unique within the same Tenant/Subsidiary.
      `,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "name",
                "tenantId",
                "subsidiaryId",
                "supplierCategoryId",
              ],
              properties: {
                name: { type: "string", example: "Proveedor Metalúrgica" },
                description: {
                  type: "string",
                  example: "Proveedor especializado en estructuras metálicas",
                },
                company: { type: "string", example: "MetalTech SRL" },
                phone: { type: "string", example: "+591 70000000" },
                telephone: { type: "string", example: "+591 4455667" },
                email: { type: "string", example: "proveedor@metaltech.com" },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
                supplierCategoryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Supplier created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Supplier created successfully.",
                supplier: {
                  id: "uuid",
                  name: "Proveedor Metalúrgica",
                  description:
                    "Proveedor especializado en estructuras metálicas",
                  company: "MetalTech SRL",
                  phone: "+591 70000000",
                  telephone: "+591 4455667",
                  email: "proveedor@metaltech.com",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  supplierCategoryId: "uuid",
                  status: true,
                  created_at: "2024-07-11T12:00:00.000Z",
                  updated_at: "2024-07-11T12:00:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or SupplierCategory mismatch.",
        },
        404: { description: "SupplierCategory not found." },
        409: { description: "A Supplier with this name already exists." },
      },
    },
  },

  "PUT: /supplier/{id}": {
    put: {
      tags: ["Supplier"],
      summary: "Update a Supplier",
      description: `
Updates an existing supplier.
- Only updates fields provided.
- Validates new name uniqueness within Tenant/Subsidiary.
- Validates SupplierCategory belongs to same Tenant/Subsidiary.
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
                name: {
                  type: "string",
                  example: "Proveedor Metales Actualizado",
                },
                description: {
                  type: "string",
                  example:
                    "Proveedor especializado en estructuras actualizadas",
                },
                company: { type: "string", example: "MetalTech SRL" },
                phone: { type: "string", example: "+591 77777777" },
                telephone: { type: "string", example: "+591 4477888" },
                email: { type: "string", example: "contacto@metaltech.com" },
                supplierCategoryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Supplier updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Supplier updated successfully.",
                supplier: {
                  id: "uuid",
                  name: "Proveedor Metales Actualizado",
                  description:
                    "Proveedor especializado en estructuras actualizadas",
                  company: "MetalTech SRL",
                  phone: "+591 77777777",
                  telephone: "+591 4477888",
                  email: "contacto@metaltech.com",
                  supplierCategoryId: "uuid",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  status: true,
                  created_at: "2024-07-11T12:00:00.000Z",
                  updated_at: "2024-07-11T14:00:00.000Z",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Supplier or SupplierCategory not found." },
        409: {
          description: "Another Supplier with this name already exists.",
        },
      },
    },
  },

  "GET: /supplier/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Supplier"],
      summary: "List Suppliers by Subsidiary",
      description: `
Returns a paginated list of suppliers for a given subsidiary.
Supports search by name, company, or phone, plus status and category filters.
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
          name: "categoryId",
          in: "query",
          schema: { type: "string", format: "uuid" },
        },
        { name: "status", in: "query", schema: { type: "boolean" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5 } },
      ],
      responses: {
        200: {
          description: "Paginated list of suppliers.",
          content: {
            "application/json": {
              example: {
                total: 1,
                page: 1,
                limit: 5,
                totalPages: 1,
                suppliers: [
                  {
                    id: "uuid",
                    name: "Proveedor Metalúrgica",
                    company: "MetalTech SRL",
                    phone: "+591 70000000",
                    supplierCategory: {
                      id: "uuid",
                      name: "Materiales",
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

  "GET: /supplier/activeBySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Supplier"],
      summary: "List active Suppliers by Subsidiary",
      description: `
Returns all active suppliers for a given subsidiary.
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
          description: "List of active suppliers.",
          content: {
            "application/json": {
              example: {
                total: 1,
                suppliers: [
                  {
                    id: "uuid",
                    name: "Proveedor Metalúrgica",
                    company: "MetalTech SRL",
                    phone: "+591 70000000",
                    email: "proveedor@metaltech.com",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /supplier/{id}": {
    get: {
      tags: ["Supplier"],
      summary: "Get Supplier by ID",
      description: `Returns a single supplier by its ID, including its category.`,
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
          description: "Supplier found.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "Proveedor Metalúrgica",
                company: "MetalTech SRL",
                phone: "+591 70000000",
                telephone: "+591 4455667",
                email: "proveedor@metaltech.com",
                description: "Proveedor especializado en estructuras metálicas",
                supplierCategory: {
                  id: "uuid",
                  name: "Materiales",
                },
                tenantId: "uuid",
                subsidiaryId: "uuid",
                created_at: "2024-07-11T12:00:00.000Z",
                updated_at: "2024-07-11T12:00:00.000Z",
              },
            },
          },
        },
        404: { description: "Supplier not found." },
      },
    },
  },

  "PATCH: /supplier/{id}/status": {
    patch: {
      tags: ["Supplier"],
      summary: "Toggle Supplier status",
      description: `Toggles the status (active/inactive) of a supplier.`,
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
          description: "Supplier status changed successfully.",
          content: {
            "application/json": {
              example: {
                message: "Supplier status changed to inactive.",
                supplier: {
                  id: "uuid",
                  name: "Proveedor Metalúrgica",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Supplier not found." },
      },
    },
  },
};
