export const scheduleSubsidiaryPaths = {
  "POST: /subsidiary/{subsidiaryId}/schedules": {
    post: {
      tags: ["ScheduleSubsidiary"],
      summary: "Create a schedule for a subsidiary",
      description:
        "Creates a new schedule associated with a specific subsidiary. The `subsidiaryId` must be a valid UUID. Days must be in ISO format.",
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
                start_day: { type: "string", example: "LUNES" },
                end_day: { type: "string", example: "JUEVES" },
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
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    example: "9c877295-43c8-40f5-ae42-dfee50c9fd2b",
                  },
                  status: {
                    type: "boolean",
                    example: true,
                  },
                  start_day: {
                    type: "string",
                    example: "LUNES",
                  },
                  end_day: {
                    type: "string",
                    example: "JUEVES",
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
                  created_at: {
                    type: "string",
                    format: "date-time",
                    example: "2025-06-15T14:21:12.809Z",
                  },
                  updated_at: {
                    type: "string",
                    format: "date-time",
                    example: "2025-06-15T14:21:12.809Z",
                  },
                  tenantId: {
                    type: "string",
                    format: "uuid",
                    example: "45f26735-86c2-4eb4-83b3-53ab756dac39",
                  },
                  subsidiaryId: {
                    type: "string",
                    format: "uuid",
                    example: "67342901-2a1a-4124-9bda-bae806ad1808",
                  },
                },
              },
            },
          },
        },
        404: { description: "Subsidiary not found" },
        409: { description: "Schedule already exists for this subsidiary." },
      },
    },
  },

  "GET: /subsidiary/{subsidiaryId}/schedules": {
    get: {
      tags: ["ScheduleSubsidiary"],
      summary: "Get all schedules for a subsidiary",
      description:
        "Returns a list of all schedules assigned to the subsidiary.",
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
          description: "List of schedules",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                      example: "35859107-cc55-4756-bc96-9021ee3aa269",
                    },
                    status: {
                      type: "boolean",
                      example: true,
                    },
                    start_day: {
                      type: "string",
                      example: "LUNES",
                    },
                    end_day: {
                      type: "string",
                      example: "VIERNES",
                    },
                    opening_hour: {
                      type: "string",
                      format: "date-time",
                      example: "2025-01-01T08:00:00.000Z",
                    },
                    closing_hour: {
                      type: "string",
                      format: "date-time",
                      example: "2025-01-01T18:00:00.000Z",
                    },
                    created_at: {
                      type: "string",
                      format: "date-time",
                      example: "2025-06-15T01:09:37.073Z",
                    },
                    updated_at: {
                      type: "string",
                      format: "date-time",
                      example: "2025-06-15T01:09:37.073Z",
                    },
                    tenantId: {
                      type: "string",
                      format: "uuid",
                      example: "45f26735-86c2-4eb4-83b3-53ab756dac39",
                    },
                    subsidiaryId: {
                      type: "string",
                      format: "uuid",
                      example: "67342901-2a1a-4124-9bda-bae806ad1808",
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: "Subsidiary not found" },
      },
    },
  },

  "PUT: /subsidiary/schedules/{id}": {
    put: {
      tags: ["ScheduleSubsidiary"],
      summary: "Update a schedule by ID",
      description:
        "Updates the schedule with the provided ID. Dates must be in ISO format.",
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
                start_day: { type: "string", example: "MARTES" },
                end_day: { type: "string", example: "SABADO" },
                opening_hour: {
                  type: "string",
                  format: "date-time",
                  example: "2025-01-01T09:00:00.000Z",
                },
                closing_hour: {
                  type: "string",
                  format: "date-time",
                  example: "2025-01-01T17:00:00.000Z",
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
              schema: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    example: "e25f45aa-663d-4df7-aef9-bbdad32b8c89",
                  },
                  status: { type: "boolean", example: true },
                  start_day: { type: "string", example: "MARTES" },
                  end_day: { type: "string", example: "SABADO" },
                  opening_hour: {
                    type: "string",
                    format: "date-time",
                    example: "2025-01-01T09:00:00.000Z",
                  },
                  closing_hour: {
                    type: "string",
                    format: "date-time",
                    example: "2025-01-01T17:00:00.000Z",
                  },
                  created_at: {
                    type: "string",
                    format: "date-time",
                    example: "2025-06-15T01:12:00.000Z",
                  },
                  updated_at: {
                    type: "string",
                    format: "date-time",
                    example: "2025-06-15T03:22:45.000Z",
                  },
                  tenantId: {
                    type: "string",
                    format: "uuid",
                    example: "45f26735-86c2-4eb4-83b3-53ab756dac39",
                  },
                  subsidiaryId: {
                    type: "string",
                    format: "uuid",
                    example: "67342901-2a1a-4124-9bda-bae806ad1808",
                  },
                },
              },
            },
          },
        },
        404: { description: "Schedule not found" },
      },
    },
  },

  "PATCH: /subsidiary/schedules/{id}/status": {
    patch: {
      tags: ["ScheduleSubsidiary"],
      summary: "Toggle schedule status (active/inactive)",
      description: "Toggles the current status of the schedule.",
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
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Schedule is now active",
                  },
                  schedule: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        example: "e25f45aa-663d-4df7-aef9-bbdad32b8c89",
                      },
                      status: {
                        type: "boolean",
                        example: true,
                      },
                      start_day: {
                        type: "string",
                        example: "LUNES",
                      },
                      end_day: {
                        type: "string",
                        example: "VIERNES",
                      },
                      opening_hour: {
                        type: "string",
                        format: "date-time",
                        example: "2025-01-01T08:00:00.000Z",
                      },
                      closing_hour: {
                        type: "string",
                        format: "date-time",
                        example: "2025-01-01T18:00:00.000Z",
                      },
                      created_at: {
                        type: "string",
                        format: "date-time",
                        example: "2025-06-15T01:12:00.000Z",
                      },
                      updated_at: {
                        type: "string",
                        format: "date-time",
                        example: "2025-06-15T03:22:45.000Z",
                      },
                      tenantId: {
                        type: "string",
                        format: "uuid",
                        example: "45f26735-86c2-4eb4-83b3-53ab756dac39",
                      },
                      subsidiaryId: {
                        type: "string",
                        format: "uuid",
                        example: "67342901-2a1a-4124-9bda-bae806ad1808",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: "Schedule not found" },
      },
    },
  },

  "DELETE: /subsidiary/schedules/{id}": {
    delete: {
      tags: ["ScheduleSubsidiary"],
      summary: "Delete a schedule",
      description: "Deletes the schedule with the given ID.",
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
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Schedule deleted successfully",
                  },
                },
              },
            },
          },
        },
        404: { description: "Schedule not found" },
      },
    },
  },
};
