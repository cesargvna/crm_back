import { z } from "zod";

export const createAllowedActionSchema = z.object({
  actionId: z
    .string({ required_error: "Action ID is required" })
    .uuid("Invalid action ID"),
  moduleId: z.string().uuid("Invalid module ID").optional(),
  submoduleId: z.string().uuid("Invalid submodule ID").optional(),
});

export const getAllAllowedActionsQuerySchema = z.object({
  moduleId: z.string().uuid("Invalid module ID").optional(),
  submoduleId: z.string().uuid("Invalid submodule ID").optional(),
});
