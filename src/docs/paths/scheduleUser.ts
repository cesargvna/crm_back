export const scheduleUserPaths = {
  "POST: /user/{userId}/schedules": {
    post: {
      tags: ["ScheduleUser"],
      summary: "Create a schedule for a user",
      description: `Crea un horario para un usuario.
- **start_day** y **end_day** deben ser días de la semana válidos en español: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO.
- **opening_hour** y **closing_hour** deben ser strings en formato 24h 'HH:mm' (ej: "08:00").
- La hora de apertura debe ser anterior a la de cierre.
- El día de inicio no debe ser posterior al de fin.
Devuelve el objeto del horario creado, incluyendo el ID, userId, tenantId y subsidiaryId.`,
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario (UUID)",
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        description: "Datos del horario a crear",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["start_day", "end_day", "opening_hour", "closing_hour"],
              properties: {
                start_day: {
                  type: "string",
                  enum: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"],
                  example: "LUNES",
                },
                end_day: {
                  type: "string",
                  enum: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"],
                  example: "VIERNES",
                },
                opening_hour: {
                  type: "string",
                  pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
                  example: "08:00",
                },
                closing_hour: {
                  type: "string",
                  pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
                  example: "16:00",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Horario creado exitosamente",
          content: {
            "application/json": {
              example: {
                id: "schedule-001",
                userId: "user-001",
                start_day: "LUNES",
                end_day: "VIERNES",
                opening_hour: "08:00",
                closing_hour: "16:00",
                status: true,
                tenantId: "tenant-001",
                subsidiaryId: "subsidiary-001",
                created_at: "2025-06-15T10:00:00.000Z",
                updated_at: "2025-06-15T10:00:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Usuario no encontrado",
          content: {
            "application/json": { example: { message: "User not found" } },
          },
        },
        409: {
          description: "Ya existe un horario con este rango para este usuario",
          content: {
            "application/json": {
              example: {
                message: "Schedule already exists for this user.",
              },
            },
          },
        },
      },
    },
  },

  "GET: /user/{userId}/schedules": {
    get: {
      tags: ["ScheduleUser"],
      summary: "Get all schedules for a user",
      description: `Obtiene la lista de horarios de un usuario con filtros:
- **page**: número de página
- **limit**: cantidad por página
- **search**: filtra por nombre de día
- **status**: true, false o all
- **sort**: asc o desc
- **orderBy**: campo para ordenar (por ejemplo updated_at)
Devuelve total, página, limit y data con los horarios encontrados.`,
      parameters: [
        { name: "userId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        { name: "page", in: "query", schema: { type: "integer", example: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", example: 5 } },
        { name: "search", in: "query", schema: { type: "string", example: "LUNES" } },
        { name: "status", in: "query", schema: { type: "string", enum: ["true", "false", "all"], example: "true" } },
        { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], example: "desc" } },
        { name: "orderBy", in: "query", schema: { type: "string", example: "updated_at" } },
      ],
      responses: {
        200: {
          description: "Lista de horarios con paginación",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                data: [
                  {
                    id: "schedule-001",
                    userId: "user-001",
                    start_day: "LUNES",
                    end_day: "MIERCOLES",
                    opening_hour: "08:00",
                    closing_hour: "15:00",
                    status: true,
                    tenantId: "tenant-001",
                    subsidiaryId: "subsidiary-001",
                    created_at: "2025-06-15T10:00:00.000Z",
                    updated_at: "2025-06-15T10:00:00.000Z",
                  },
                  {
                    id: "schedule-002",
                    userId: "user-001",
                    start_day: "JUEVES",
                    end_day: "VIERNES",
                    opening_hour: "09:00",
                    closing_hour: "17:00",
                    status: true,
                    tenantId: "tenant-001",
                    subsidiaryId: "subsidiary-001",
                    created_at: "2025-06-15T10:00:00.000Z",
                    updated_at: "2025-06-15T10:00:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },

  "GET: /user/schedules/{id}": {
    get: {
      tags: ["ScheduleUser"],
      summary: "Get schedule by ID",
      description: "Obtiene un horario por su ID.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "Horario encontrado",
          content: {
            "application/json": {
              example: {
                id: "schedule-001",
                userId: "user-001",
                start_day: "LUNES",
                end_day: "VIERNES",
                opening_hour: "08:00",
                closing_hour: "16:30",
                status: true,
                tenantId: "tenant-001",
                subsidiaryId: "subsidiary-001",
                created_at: "2025-06-15T10:00:00.000Z",
                updated_at: "2025-06-15T10:00:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Horario no encontrado",
          content: {
            "application/json": { example: { message: "Schedule not found." } },
          },
        },
      },
    },
  },

  "PUT: /user/schedules/{id}": {
    put: {
      tags: ["ScheduleUser"],
      summary: "Update a schedule",
      description: `Actualiza un horario existente.
- Mismos requisitos de días y horas que en creación.
Verifica duplicados para el mismo usuario.`,
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      requestBody: {
        required: true,
        description: "Nuevos valores para el horario",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["start_day", "end_day", "opening_hour", "closing_hour"],
              properties: {
                start_day: { type: "string", example: "MARTES" },
                end_day: { type: "string", example: "SABADO" },
                opening_hour: { type: "string", example: "09:00" },
                closing_hour: { type: "string", example: "17:00" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Horario actualizado correctamente",
          content: {
            "application/json": {
              example: {
                id: "schedule-001",
                userId: "user-001",
                start_day: "MARTES",
                end_day: "SABADO",
                opening_hour: "09:00",
                closing_hour: "17:00",
                status: true,
                tenantId: "tenant-001",
                subsidiaryId: "subsidiary-001",
                updated_at: "2025-06-15T12:00:00.000Z",
              },
            },
          },
        },
        404: { description: "Horario no encontrado" },
        409: { description: "Rango duplicado para este usuario" },
      },
    },
  },

  "PATCH: /user/schedules/{id}/status": {
    patch: {
      tags: ["ScheduleUser"],
      summary: "Toggle schedule status",
      description: "Activa o desactiva un horario por ID.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "Estado del horario actualizado",
          content: {
            "application/json": {
              example: {
                message: "Schedule is now active",
                schedule: { id: "schedule-001", status: true },
              },
            },
          },
        },
        404: { description: "Horario no encontrado" },
      },
    },
  },

  "DELETE: /user/schedules/{id}": {
    delete: {
      tags: ["ScheduleUser"],
      summary: "Delete a schedule",
      description: "Elimina un horario por ID.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      responses: {
        200: {
          description: "Horario eliminado correctamente",
          content: {
            "application/json": { example: { message: "Schedule deleted successfully" } },
          },
        },
        404: { description: "Horario no encontrado" },
      },
    },
  },
};
