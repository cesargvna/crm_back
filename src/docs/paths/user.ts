// src/docs/paths/user.ts

export const userPaths = {
  "POST: /user": {
    post: {
      tags: ["User"],
      summary: "Create a new user",
      description:
        "Creates a new user in the system. Automatically assigns tenantId based on the provided subsidiaryId.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "username",
                "password",
                "name",
                "roleId",
                "subsidiaryId",
              ],
              properties: {
                username: { type: "string", example: "juanperez.123" },
                password: { type: "string", example: "securePassword123" },
                name: { type: "string", example: "Juan" },
                lastname: { type: "string", example: "Pérez" },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "987654321" },
                description: {
                  type: "string",
                  example: "Usuario encargado de ventas",
                },
                address: { type: "string", example: "Av. Siempre Viva 742" },
                cellphone: { type: "string", example: "+59171234567" },
                telephone: { type: "string", example: "44556677" },
                email: { type: "string", example: "juan@example.com" },
                roleId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "User created successfully." },
        400: { description: "Validation error." },
        404: { description: "Subsidiary not found." },
        409: { description: "Username already exists." },
      },
    },
  },

  "GET: /user/{id}": {
    get: {
      tags: ["User"],
      summary: "Get user by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: { description: "User retrieved successfully." },
        404: { description: "User not found." },
      },
    },
  },

  "GET: /user/by-tenant/{tenantId}": {
    get: {
      tags: ["User"],
      summary: "Get users by tenant",
      parameters: [
        {
          name: "tenantId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          $ref: "#/components/parameters/PaginationQuery",
        },
      ],
      responses: {
        200: { description: "List of users by tenant." },
        404: { description: "Tenant not found." },
      },
    },
  },

  "GET: /user/by-subsidiary/{subsidiaryId}": {
    get: {
      tags: ["User"],
      summary: "Get users by subsidiary",
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          $ref: "#/components/parameters/PaginationQuery",
        },
      ],
      responses: {
        200: { description: "List of users by subsidiary." },
        404: { description: "Subsidiary not found." },
      },
    },
  },

  "PUT: /user/{id}": {
    put: {
      tags: ["User"],
      summary: "Update user",
      description:
        "Updates user fields. Username, tenantId, subsidiaryId and password cannot be changed.",
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
                name: { type: "string", example: "Juan" },
                lastname: { type: "string", example: "Pérez" },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "987654321" },
                description: {
                  type: "string",
                  example: "Encargado de inventario",
                },
                address: { type: "string", example: "Calle 8 #123" },
                cellphone: { type: "string", example: "+59178945612" },
                telephone: { type: "string", example: "4661122" },
                email: { type: "string", example: "nuevo@email.com" },
                roleId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User updated successfully." },
        404: { description: "User not found." },
      },
    },
  },

  "PATCH: /user/{id}/status": {
    patch: {
      tags: ["User"],
      summary: "Toggle user status",
      description: "Activates or deactivates a user.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: { description: "User status updated." },
        404: { description: "User not found." },
      },
    },
  },

  "PATCH: /user/{id}/password": {
    patch: {
      tags: ["User"],
      summary: "Update user password",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["newPassword"],
              properties: {
                newPassword: { type: "string", example: "newStrongPass123" },
              },
            },
          },
        },
      },
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: { description: "Password updated successfully." },
        400: { description: "Invalid password." },
        404: { description: "User not found." },
      },
    },
  },
};
