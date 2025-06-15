export const scheduleUserPaths = {
  "POST: /user/{userId}/schedules": {
    post: {
      tags: ["ScheduleUser"],
      summary: "Create a schedule for a user",
      description:
        "Creates a new schedule associated with a specific user. The `userId` must be a valid UUID. Dates must be in ISO format.",
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
                  format: "date-time",
                  example: "2025-06-12T08:00:00.000Z",
                },
                closing_hour: {
                  type: "string",
                  format: "date-time",
                  example: "2025-06-12T18:00:00.000Z",
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
                opening_hour: "2025-06-12T08:00:00.000Z",
                closing_hour: "2025-06-12T18:00:00.000Z",
                status: true,
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
                  start_day: "LUNES",
                  end_day: "VIERNES",
                  opening_hour: "2025-06-12T08:00:00.000Z",
                  closing_hour: "2025-06-12T18:00:00.000Z",
                  status: true,
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
      description:
        "Updates an existing schedule by its ID. Dates must be in ISO format.",
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
                  format: "date-time",
                  example: "2025-06-12T09:00:00.000Z",
                },
                closing_hour: {
                  type: "string",
                  format: "date-time",
                  example: "2025-06-12T17:00:00.000Z",
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
                opening_hour: "2025-06-12T09:00:00.000Z",
                closing_hour: "2025-06-12T17:00:00.000Z",
              },
            },
          },
        },
        404: { description: "Schedule not found" },
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
