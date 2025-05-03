import { z } from "zod";

export const scheduleSubsidiarySchema = z.object({
    subsidiaryId: z
        .string()
        .nonempty("Subsidiary ID is required."),
    
    start_day: z
        .string()
        .min(3, "Start day must be at least 3 characters.")
        .max(20, "Start day must not exceed 20 characters.")
        .optional()
        .nullable(),
    
    end_day: z
        .string()
        .min(3, "End day must be at least 3 characters.")
        .max(20, "End day must not exceed 20 characters.")
        .optional()
        .nullable(),
    
    opening_hour: z.coerce.date()
        .refine(date => !isNaN(date.getTime()), {
            message: "Opening hour must be a valid timestamp."
        })
        .optional()
        .nullable(),
    
    closing_hour: z.coerce.date()
        .refine(date => !isNaN(date.getTime()), {
            message: "Closing hour must be a valid timestamp."
        })
        .optional()
        .nullable(),
})
.superRefine((data, ctx) => {
    if (data.opening_hour && data.closing_hour && data.opening_hour >= data.closing_hour) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Opening hour must be earlier than closing hour.",
            path: ["opening_hour"],
        });
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Closing hour must be later than opening hour.",
            path: ["closing_hour"],
        });
    }
});
