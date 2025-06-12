export const scheduleSubsidiaryPaths = {
  "POST: /subsidiary/{subsidiaryId}/schedules": {
    post: {
      tags: ["ScheduleSubsidiary"],
      summary: "Create a schedule for a subsidiary",
      description:
        "Creates a new schedule associated with a specific subsidiary. The `subsidiaryId` must be a valid UUID. Dates must be in ISO format.",
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
        201: { description: "Schedule created successfully" },
        404: { description: "Subsidiary not found" },
      },
    },
  },

  "GET: /subsidiary/{subsidiaryId}/schedules": {
    get: {
      tags: ["ScheduleSubsidiary"],
      summary: "Get all schedules for a subsidiary",
      description: "Retrieves a list of schedules associated with a specific subsidiary.",
      parameters: [
        {
          name: "subsidiaryId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: { description: "List of schedules" },
        404: { description: "Subsidiary not found" },
      },
    },
  },

  "PUT: /subsidiary/schedules/{id}": {
    put: {
      tags: ["ScheduleSubsidiary"],
      summary: "Update a schedule",
      description: "Updates an existing schedule by its ID. Dates must be ISO format.",
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
        200: { description: "Schedule updated successfully" },
        404: { description: "Schedule not found" },
      },
    },
  },

  "PATCH: /subsidiary/schedules/{id}/status": {
    patch: {
      tags: ["ScheduleSubsidiary"],
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
        200: { description: "Schedule status updated" },
        404: { description: "Schedule not found" },
      },
    },
  },

  "DELETE: /subsidiary/schedules/{id}": {
    delete: {
      tags: ["ScheduleSubsidiary"],
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
        200: { description: "Schedule deleted successfully" },
        404: { description: "Schedule not found" },
      },
    },
  },
};
