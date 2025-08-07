export const clientPaths = {
  "POST: /client": {
    post: {
      tags: ["Client"],
      summary: "Create a new client",
      description: `
Creates a new client linked to a specific client category and subsidiary.  
- The \`name\` is normalized: no accents, no "ñ" (converted to "n").  
- Email is trimmed and converted to lowercase.  
- The \`name\` must be unique within the same tenant + subsidiary.
- Client category must exist and belong to the same tenant and subsidiary.
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
                "clientCategoryId",
              ],
              properties: {
                name: { type: "string", example: "Juan Perez" },
                lastname: { type: "string", example: "Perez" },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "87654321" },
                description: { type: "string", example: "Frequent client" },
                address: { type: "string", example: "Calle Falsa 123" },
                cellphone: { type: "string", example: "+59178945612" },
                telephone: { type: "string", example: "+5914661122" },
                email: {
                  type: "string",
                  format: "email",
                  example: "juan@example.com",
                },
                tenantId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
                clientCategoryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Client created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Client created successfully.",
                client: {
                  id: "uuid",
                  name: "Juan Perez",
                  lastname: "Perez",
                  ci: "12345678",
                  nit: "87654321",
                  description: "Frequent client",
                  address: "Calle Falsa 123",
                  cellphone: "+59178945612",
                  telephone: "+5914661122",
                  email: "juan@example.com",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  clientCategoryId: "uuid",
                  client_points: 0,
                  status: true,
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Client category not found." },
        409: { description: "Duplicate name for this tenant and subsidiary." },
      },
    },
  },

  "PUT: /client/{id}": {
    put: {
      tags: ["Client"],
      summary: "Update client",
      description: `
Updates client fields.  
- The \`name\` is normalized if provided.  
- If \`name\` changes, uniqueness is validated again.
- If \`clientCategoryId\` changes, the new category must belong to the same tenant and subsidiary.
- \`client_points\`, \`tenantId\` and \`subsidiaryId\` cannot be updated here.
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
                name: { type: "string", example: "Juan P." },
                lastname: { type: "string", example: "Perez" },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "87654321" },
                description: { type: "string", example: "Updated description" },
                address: { type: "string", example: "Nueva direccion" },
                cellphone: { type: "string", example: "+59178945612" },
                telephone: { type: "string", example: "+5914661122" },
                email: {
                  type: "string",
                  format: "email",
                  example: "juan.p@example.com",
                },
                clientCategoryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Client updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Client updated successfully.",
                client: {
                  id: "uuid",
                  name: "Juan P.",
                  lastname: "Perez",
                  status: true,
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Client not found." },
        409: { description: "Duplicate name for this tenant and subsidiary." },
      },
    },
  },

  "PATCH: /client/{id}/status": {
    patch: {
      tags: ["Client"],
      summary: "Toggle client status",
      description: `
Activates or deactivates a client.  
- Changes \`status\` between true and false.
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
          description: "Client status updated.",
          content: {
            "application/json": {
              example: {
                message: "Client status changed to inactive.",
                client: {
                  id: "uuid",
                  name: "Juan Perez",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Client not found." },
      },
    },
  },

  "GET: /client/{id}": {
    get: {
      tags: ["Client"],
      summary: "Get client by ID",
      description: `
Returns a client by its ID, including its linked category.
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
          description: "Client retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "Juan Perez",
                lastname: "Perez",
                ci: "12345678",
                nit: "87654321",
                description: "Frequent client",
                address: "Calle Falsa 123",
                cellphone: "+59178945612",
                telephone: "+5914661122",
                email: "juan@example.com",
                status: true,
                client_points: 0,
                tenantId: "uuid",
                subsidiaryId: "uuid",
                clientCategory: {
                  id: "uuid",
                  name: "VIP Clients",
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "Client not found." },
      },
    },
  },

  "GET: /client/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Client"],
      summary: "Get clients by subsidiary",
      description: `
Returns a paginated list of clients belonging to a subsidiary.  
Supports search by name, lastname, CI or NIT.  
Can filter by status.
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
          schema: { type: "string", enum: ["true", "false"], default: "all" },
        },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5 } },
      ],
      responses: {
        200: {
          description: "List of clients by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 1,
                page: 1,
                limit: 5,
                totalPages: 1,
                clients: [
                  {
                    id: "uuid",
                    name: "Juan Perez",
                    status: true,
                    clientCategory: { id: "uuid", name: "VIP Clients" },
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /client/activeBySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["Client"],
      summary: "Get active clients by subsidiary",
      description: `
Returns only active clients for the given subsidiary.
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
          description: "List of active clients by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 1,
                clients: [
                  {
                    id: "uuid",
                    name: "Juan Perez",
                    lastname: "Perez",
                    email: "juan@example.com",
                    cellphone: "+59178945612",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};
