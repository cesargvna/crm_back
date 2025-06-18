export const scheduleSubsidiaryPaths = {
  "POST: /subsidiary/{subsidiaryId}/schedules": {
    post: {
      tags: ["ScheduleSubsidiary"],
      summary: "Create a schedule for a subsidiary",
      description: `Creates a new schedule associated with a specific subsidiary.
        \n- \`start_day\` and \`end_day\` must be valid days of the week in Spanish: 
        \`LUNES\`, \`MARTES\`, \`MIERCOLES\`, \`JUEVES\`, \`VIERNES\`, \`SABADO\`, \`DOMINGO\`.
        \n- \`opening_hour\` and \`closing_hour\` must be strings in 24-hour \`HH:mm\` format (e.g., \`08:00\`, \`16:30\`).
        \n- The opening hour must be earlier than the closing hour.
        \n- The start day must not be after the end day.`,
      parameters: [
        {
          name: "subsidiaryId",
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
              required: [
                "start_day",
                "end_day",
                "opening_hour",
                "closing_hour",
              ],
              properties: {
                start_day: {
                  type: "string",
                  enum: [
                    "LUNES",
                    "MARTES",
                    "MIERCOLES",
                    "JUEVES",
                    "VIERNES",
                    "SABADO",
                    "DOMINGO",
                  ],
                  example: "LUNES",
                },
                end_day: {
                  type: "string",
                  enum: [
                    "LUNES",
                    "MARTES",
                    "MIERCOLES",
                    "JUEVES",
                    "VIERNES",
                    "SABADO",
                    "DOMINGO",
                  ],
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
                  example: "16:30",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Schedule created successfully",
          content: {
            "application/json": {
              example: {
                id: "schedule-sub-001",
                subsidiaryId: "subsidiary-001",
                tenantId: "tenant-001",
                start_day: "LUNES",
                end_day: "VIERNES",
                opening_hour: "08:00",
                closing_hour: "16:30",
                status: true,
                created_at: "2025-06-15T10:00:00.000Z",
                updated_at: "2025-06-15T10:00:00.000Z",
              },
            },
          },
        },
        404: {
          description: "Subsidiary not found",
          content: {
            "application/json": {
              example: { message: "Subsidiary not found" },
            },
          },
        },
        409: {
          description: "Schedule already exists for this subsidiary",
          content: {
            "application/json": {
              example: {
                message: "Schedule already exists for this subsidiary.",
              },
            },
          },
        },
      },
    },
  },

  "GET: /subsidiary/{subsidiaryId}/schedules": {
    get: {
      tags: ["ScheduleSubsidiary"],
      summary: "Get all schedules for a subsidiary (paginated)",
      description:
        "Retrieves a paginated list of schedules assigned to a specific subsidiary. Supports filters and search.",
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "integer", default: 1, minimum: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", default: 5, minimum: 1, maximum: 100 },
        },
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Search by start_day or end_day",
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["all", "true", "false"],
            default: "all",
          },
        },
        {
          name: "orderBy",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["start_day", "created_at", "updated_at"],
            default: "start_day",
          },
        },
        {
          name: "sort",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
          },
        },
      ],
      responses: {
        "200": {
          description: "Paginated list of schedules",
          content: {
            "application/json": {
              example: {
                total: 2,
                page: 1,
                limit: 5,
                data: [
                  {
                    id: "schedule-sub-001",
                    subsidiaryId: "subsidiary-001",
                    tenantId: "tenant-001",
                    start_day: "LUNES",
                    end_day: "VIERNES",
                    opening_hour: "08:00",
                    closing_hour: "16:30",
                    status: true,
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

  "PUT: /subsidiary/schedules/{id}": {
    put: {
      tags: ["ScheduleSubsidiary"],
      summary: "Update a schedule for a subsidiary",
      description: `Updates an existing schedule by ID.
        \n- \`start_day\` and \`end_day\` must be valid days of the week in Spanish: 
        \`LUNES\`, \`MARTES\`, \`MIERCOLES\`, \`JUEVES\`, \`VIERNES\`, \`SABADO\`, \`DOMINGO\`.
        \n- \`opening_hour\` and \`closing_hour\` must be strings in 24-hour \`HH:mm\` format (e.g., \`08:00\`, \`16:30\`).
        \n- The opening hour must be earlier than the closing hour.
        \n- The start day must not be after the end day.`,
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
              required: [
                "start_day",
                "end_day",
                "opening_hour",
                "closing_hour",
              ],
              properties: {
                start_day: {
                  type: "string",
                  enum: [
                    "LUNES",
                    "MARTES",
                    "MIERCOLES",
                    "JUEVES",
                    "VIERNES",
                    "SABADO",
                    "DOMINGO",
                  ],
                  example: "MARTES",
                },
                end_day: {
                  type: "string",
                  enum: [
                    "LUNES",
                    "MARTES",
                    "MIERCOLES",
                    "JUEVES",
                    "VIERNES",
                    "SABADO",
                    "DOMINGO",
                  ],
                  example: "SABADO",
                },
                opening_hour: {
                  type: "string",
                  pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
                  example: "09:00",
                },
                closing_hour: {
                  type: "string",
                  pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
                  example: "17:00",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Schedule updated successfully",
          content: {
            "application/json": {
              example: {
                id: "schedule-sub-001",
                subsidiaryId: "subsidiary-001",
                tenantId: "tenant-001",
                start_day: "MARTES",
                end_day: "SABADO",
                opening_hour: "09:00",
                closing_hour: "17:00",
                status: true,
                updated_at: "2025-06-15T12:34:56.000Z",
              },
            },
          },
        },
        404: {
          description: "Schedule not found",
          content: {
            "application/json": {
              example: { message: "Schedule not found" },
            },
          },
        },
        409: {
          description: "Schedule already exists for this subsidiary",
          content: {
            "application/json": {
              example: {
                message: "Schedule already exists for this subsidiary.",
              },
            },
          },
        },
      },
    },
  },

  "PATCH: /subsidiary/schedules/{id}/status": {
    patch: {
      tags: ["ScheduleSubsidiary"],
      summary: "Toggle schedule status",
      description: "Toggles the active/inactive status of a schedule by ID.",
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
          description: "Schedule status updated",
          content: {
            "application/json": {
              example: {
                message: "Schedule is now active",
                schedule: {
                  id: "schedule-sub-001",
                  status: true,
                },
              },
            },
          },
        },
        404: {
          description: "Schedule not found",
          content: {
            "application/json": { example: { message: "Schedule not found" } },
          },
        },
      },
    },
  },

  "DELETE: /subsidiary/schedules/{id}": {
    delete: {
      tags: ["ScheduleSubsidiary"],
      summary: "Delete a subsidiary schedule",
      description: "Deletes a schedule by its ID.",
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
          description: "Schedule deleted successfully",
          content: {
            "application/json": {
              example: { message: "Schedule deleted successfully" },
            },
          },
        },
        404: {
          description: "Schedule not found",
          content: {
            "application/json": { example: { message: "Schedule not found" } },
          },
        },
      },
    },
  },
};
