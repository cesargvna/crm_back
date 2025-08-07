export const userPaths = {
  "POST: /user": {
    post: {
      tags: ["User"],
      summary: "Create a new user",
      description: `
Creates a new user in the system.  
- The \`username\` is normalized: only lowercase letters, numbers and dot. No spaces, no accents, no "ñ" (converted to "n").  
- \`username\` must be globally unique.  
- The \`tenantId\` is assigned automatically based on the selected \`subsidiaryId\`.  
- Email and phone numbers must follow valid formats.
`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "password", "name", "roleId", "subsidiaryId"],
              properties: {
                username: { type: "string", example: "juan.perez" },
                password: { type: "string", example: "securePassword123" },
                name: { type: "string", example: "Juan" },
                lastname: { type: "string", example: "Pérez" },
                ci: { type: "string", example: "12345678" },
                nit: { type: "string", example: "987654321" },
                description: { type: "string", example: "Usuario encargado de ventas" },
                address: { type: "string", example: "Av. Siempre Viva 742" },
                cellphone: { type: "string", example: "+59171234567" },
                telephone: { type: "string", example: "+59144556677" },
                email: { type: "string", format: "email", example: "juan@example.com" },
                roleId: { type: "string", format: "uuid" },
                subsidiaryId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                username: "juan.perez",
                name: "Juan",
                lastname: "Pérez",
                ci: "12345678",
                nit: "987654321",
                description: "Usuario encargado de ventas",
                address: "Av. Siempre Viva 742",
                cellphone: "+59171234567",
                telephone: "+59144556677",
                email: "juan@example.com",
                roleId: "uuid-role",
                subsidiaryId: "uuid-sub",
                tenantId: "uuid-tenant",
                status: true,
              },
            },
          },
        },
        400: { description: "Validation error" },
        404: { description: "Subsidiary not found" },
        409: { description: "Username already exists" },
      },
    },
  },

  "PUT: /user/{id}": {
    put: {
      tags: ["User"],
      summary: "Update user",
      description: `
Updates user fields.  
- \`username\`, \`tenantId\`, \`subsidiaryId\` and \`password\` cannot be changed here.  
- Normalization applies to names.  
- Email and phone numbers must follow valid formats.
`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
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
                description: { type: "string", example: "Encargado de inventario" },
                address: { type: "string", example: "Calle 8 #123" },
                cellphone: { type: "string", example: "+59178945612" },
                telephone: { type: "string", example: "+5914661122" },
                email: { type: "string", format: "email", example: "nuevo@email.com" },
                roleId: { type: "string", format: "uuid" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "User updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "User updated successfully.",
                user: {
                  id: "uuid",
                  username: "juan.perez",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  roleId: "uuid",
                },
              },
            },
          },
        },
        404: { description: "User not found." },
      },
    },
  },

  "PATCH: /user/{id}/status": {
    patch: {
      tags: ["User"],
      summary: "Toggle user status",
      description: `
Activates or deactivates a user.  
- Changes \`status\` between true and false.
`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "User status updated.",
          content: {
            "application/json": {
              example: {
                message: "User status updated to active.",
                user: {
                  id: "uuid",
                  username: "juan.perez",
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "User not found." },
      },
    },
  },

  "PATCH: /user/{id}/password": {
    patch: {
      tags: ["User"],
      summary: "Update user password",
      description: `
Updates a user's password.  
- Minimum 6 characters required.
`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
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
      responses: {
        200: {
          description: "Password updated successfully.",
          content: {
            "application/json": {
              example: {
                message: "Password updated successfully.",
                user: {
                  id: "uuid",
                  username: "juan.perez",
                  tenantId: "uuid",
                  subsidiaryId: "uuid",
                  roleId: "uuid",
                },
              },
            },
          },
        },
        400: { description: "Invalid password." },
        404: { description: "User not found." },
      },
    },
  },

  "GET: /user/simple/{id}": {
    get: {
      tags: ["User"],
      summary: "Get simplified user by ID",
      description: `
Returns a simplified user object for edit forms:  
- Only core fields: name, ci, role, etc.
`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "Simplified user retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                name: "Juan",
                lastname: "Pérez",
                ci: "12345678",
                nit: "987654321",
                description: "Encargado de almacén",
                address: "Av. Siempre Viva 742",
                cellphone: "+59171234567",
                telephone: "+59144556677",
                email: "juan@example.com",
                status: true,
                role: {
                  id: "uuid",
                  name: "Almacén",
                  status: true,
                },
              },
            },
          },
        },
        404: { description: "User not found." },
      },
    },
  },

  "GET: /user/{id}": {
    get: {
      tags: ["User"],
      summary: "Get user by ID",
      description: `
Returns full user info:  
- Includes role details and permissions hierarchy.
- Includes schedulesUsers.
`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "User retrieved successfully.",
          content: {
            "application/json": {
              example: {
                id: "uuid",
                username: "juan.perez",
                name: "Juan",
                lastname: "Pérez",
                ci: "12345678",
                nit: "987654321",
                description: "Usuario de inventario",
                address: "Av. Siempre Viva 742",
                cellphone: "+59171234567",
                telephone: "+59144556677",
                email: "juan@example.com",
                status: true,
                tenantId: "uuid",
                subsidiary: { id: "uuid", name: "Sucursal Central" },
                role: {
                  id: "uuid",
                  name: "Admin",
                  status: true,
                  permissions: {
                    Inventario: {
                      Productos: { actions: [{ id: "perm-001", action: "ver" }] },
                    },
                  },
                },
                schedules: [],
              },
            },
          },
        },
        404: { description: "User not found." },
      },
    },
  },

  "GET: /user/by-subsidiary/{subsidiaryId}": {
    get: {
      tags: ["User"],
      summary: "Get users by subsidiary",
      description: `
Returns a paginated list of users belonging to a subsidiary.  
Supports search by name, username, ci, or nit.
`,
      parameters: [
        { name: "subsidiaryId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["true", "false", "all"], default: "all" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 5, maximum: 100 } },
        { name: "orderBy", in: "query", schema: { type: "string", default: "name" } },
        { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" } },
      ],
      responses: {
        200: {
          description: "List of users by subsidiary.",
          content: {
            "application/json": {
              example: {
                total: 1,
                page: 1,
                limit: 10,
                data: [
                  {
                    id: "uuid",
                    username: "juan.perez",
                    name: "Juan",
                    lastname: "Pérez",
                    status: true,
                    role: { id: "uuid", name: "Admin" },
                    subsidiary: { id: "uuid", name: "Sucursal Central" },
                    schedulesUsers: [],
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
