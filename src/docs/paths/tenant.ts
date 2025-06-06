export const tenantPaths = {
  "/tenant": {
    get: {
      tags: ["Tenant"],
      summary: "Obtener todos los tenants",
      responses: {
        200: { description: "Tenants obtenidos" },
      },
    },
    post: {
      tags: ["Tenant"],
      summary: "Crear un nuevo tenant",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
      },
      responses: {
        201: { description: "Tenant creado" },
      },
    },
  },
  "/tenant/{id}": {
    get: {
      tags: ["Tenant"],
      summary: "Obtener tenant por ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Tenant encontrado" },
        404: { description: "Tenant no encontrado" },
      },
    },
  },
  "/tenant/{id}/toggle": {
    patch: {
      tags: ["Tenant"],
      summary: "Cambiar estado de un tenant",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Estado actualizado" },
      },
    },
  },
};