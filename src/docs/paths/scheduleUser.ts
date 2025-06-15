export const scheduleUserPaths = {
  "POST: /user/{userId}/schedules": {
    post: {
      tags: ["ScheduleUser"],
      summary: "Create a schedule for a user",
      description: `Creates an user schedule based on day and time range. 
        \n- \`start_day\` and \`end_day\` must be valid days of the week in Spanish: 
        \`LUNES\`, \`MARTES\`, \`MIERCOLES\`, \`JUEVES\`, \`VIERNES\`, \`SABADO\`, \`DOMINGO\`.
        \n- \`opening_hour\` and \`closing_hour\` must be strings in 24-hour \`HH:mm\` format (e.g., \`08:00\`, \`16:30\`).
        \n- The opening hour must be earlier than the closing hour.
        \n- The start day must not be after the end day.`,
      parameters: [
        {
          name: "userId",
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
          description: "User not found",
          content: {
            "application/json": { example: { message: "User not found" } },
          },
        },
        409: {
          description: "Schedule already exists for this user",
          content: {
            "application/json": {
              example: { message: "Schedule already exists for this user." },
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
      description:
        "Retrieves a list of schedules associated with a specific user.",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "List of schedules",
          content: {
            "application/json": {
              example: [
                {
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
              ],
            },
          },
        },
      },
    },
  },

  "PUT: /user/schedules/{id}": {
    put: {
      tags: ["ScheduleUser"],
      summary: "Update a schedule",
      description: `Updates an user schedule based on day and time range. 
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
                id: "schedule-001",
                userId: "user-001",
                start_day: "MARTES",
                end_day: "SABADO",
                opening_hour: "09:00",
                closing_hour: "17:00",
                status: true,
                tenantId: "tenant-001",
                subsidiaryId: "subsidiary-001",
                updated_at: "2025-06-15T12:34:56.000Z",
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
        409: {
          description:
            "Another schedule with the same range already exists for this user.",
          content: {
            "application/json": {
              example: {
                message:
                  "Another schedule with the same range already exists for this user.",
              },
            },
          },
        },
      },
    },
  },

  "PATCH: /user/schedules/{id}/status": {
    patch: {
      tags: ["ScheduleUser"],
      summary: "Toggle schedule status",
      description:
        "Toggles the `status` (active/inactive) of a schedule by ID.",
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
                  id: "schedule-001",
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

  "DELETE: /user/schedules/{id}": {
    delete: {
      tags: ["ScheduleUser"],
      summary: "Delete a schedule",
      description: "Deletes a schedule by ID.",
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
