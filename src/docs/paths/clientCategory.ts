export const clientCategoryPaths = {
  "POST: /client/categories": {
    post: {
      tags: ["ClientCategory"],
      summary: "Create a new client category",
      description: `
Creates a new client category linked to a specific subsidiary and tenant.  
- The \`name\` is normalized to lowercase, without accents, and "ñ" is converted to "n".  
- \`name\` must be unique per tenant + subsidiary.  
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
                name: { type: "string", example: "VIP Clients" },
                description: {
                  type: "string",
                  example: "Category for top clients",
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
          description: "Client category created successfully.",
          content: {
            "application/json": {
              example: {
                message: "Client category created successfully.",
                category: {
                  id: "uuid",
                  name: "vip clients",
                  description: "Category for top clients",
                  status: true,
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                },
              },
            },
          },
        },
        400: { description: "Validation error." },
        404: { description: "Subsidiary not found." },
        409: { description: "Duplicate name for this tenant and subsidiary." },
      },
    },
  },

  "PUT: /client/categories/{id}": {
    put: {
      tags: ["ClientCategory"],
      summary: "Update client category",
      description: `
Updates the name and description of a client category.  
- The \`name\` is normalized.  
- Cannot update tenantId or subsidiaryId.
- If name changes, uniqueness is re-validated within the same tenant + subsidiary.
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
                name: { type: "string", example: "Updated VIP Clients" },
                description: { type: "string", example: "Updated description" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Client category updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Client category updated successfully.",
                category: {
                  id: "uuid",
                  name: "updated vip clients",
                  description: "Updated description",
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "Client category not found." },
        409: { description: "Duplicate name for this tenant and subsidiary." },
      },
    },
  },

  "GET: /client/categories/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["ClientCategory"],
      summary: "Get client categories by subsidiary",
      description: `
Returns a paginated list of client categories for the given subsidiary.  
Supports search in \`name\` and \`description\`.  
Supports filtering by \`status\`.
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
          description: "List of client categories.",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                totalPages: 1,
                categories: [
                  {
                    id: "uuid",
                    name: "vip clients",
                    description: "Top clients",
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

  "GET: /client/categoriesActive/bySubsidiary/{subsidiaryId}": {
    get: {
      tags: ["ClientCategory"],
      summary: "Get active client categories by subsidiary",
      description: `
Returns only active client categories for the given subsidiary.
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
          description: "List of active client categories.",
          content: {
            "application/json": {
              example: {
                total: 1,
                categories: [
                  {
                    id: "uuid",
                    name: "vip clients",
                    description: "Top clients",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /client/categories/{id}": {
    get: {
      tags: ["ClientCategory"],
      summary: "Get client category by ID",
      description: `
Returns a client category by its ID.
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
          description: "Client category retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "vip clients",
                description: "Top clients",
                status: true,
                tenantId: "uuid",
                subsidiaryId: "uuid",
              },
            },
          },
        },
        404: { description: "Client category not found." },
      },
    },
  },

  "PATCH: /client/categories/{id}/status": {
    patch: {
      tags: ["ClientCategory"],
      summary: "Toggle client category status",
      description: `
Toggles the \`status\` of a client category between active and inactive.  
- When toggled, all related clients are activated or deactivated automatically.
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
          description:
            "Client category status updated, related clients updated too.",
          content: {
            "application/json": {
              example: {
                message:
                  "Client category status changed to inactive, and all related clients have been deactivated.",
                category: {
                  id: "uuid",
                  name: "vip clients",
                  status: false,
                },
              },
            },
          },
        },
        404: { description: "Client category not found." },
      },
    },
  },
};
