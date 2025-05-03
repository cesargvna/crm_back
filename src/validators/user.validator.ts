import { optional, z } from "zod";

export const userSchema = z.object({
    username: z
        .string()
        .min(3, "Username must have at least 3 characters.")
        .max(100, "Username must not exceed 100 characters.")
        .nonempty("Username is required."),

    password: z
        .string()
        .min(6, "Password must have at least 6 characters.")
        .max(100, "Password must not exceed 100 characters.")
        .nonempty("Password is required.")
        .optional(),

    name: z
        .string()
        .min(2, "Name must have at least 2 characters.")
        .max(100, "Name must not exceed 100 characters.")
        .nonempty("Name is required."),

    ci_nit: z
        .string()
        .max(50, "CI/NIT must not exceed 50 characters.")
        .nonempty("CI/NIT is required."),

    description: z
        .string()
        .max(255, "Description must not exceed 255 characters.")
        .optional()
        .nullable(),

    address: z
        .string()
        .max(100, "Address must not exceed 100 characters.")
        .optional()
        .nullable(),

    cellphone: z
        .string()
        .max(50, "Cellphone number must not exceed 50 characters.")
        .regex(/^[+\d][\d\s]*$/, "Cellphone number must contain only digits, spaces, or start with '+'.")
        .optional()
        .nullable(),

    telephone: z
        .string()
        .max(50, "Telephone number must not exceed 50 characters.")
        .regex(/^[+\d][\d\s]*$/, "Telephone number must contain only digits, spaces, or start with '+'.")
        .optional()
        .nullable(),

    email: z
        .string()
        .email("Invalid email format.")
        .max(80, "Email must not exceed 80 characters.")
        .optional()
        .nullable(),

    status: z.boolean().optional(),

    entry_time: z.coerce.date()
        .refine(date => !isNaN(date.getTime()), {
            message: "Entry time must be a valid timestamp."
        })
        .optional()
        .nullable(),

    exit_time: z.coerce.date()
        .refine(date => !isNaN(date.getTime()), {
            message: "Exit time must be a valid timestamp."
        })
        .optional()
        .nullable(),
    roleId: z.string().nonempty("Role ID is required."),
    subsidiaryId: z.string().nonempty("Subsidiary ID is required."),
})
.superRefine((data, ctx) => {
    if (data.entry_time && data.exit_time && data.entry_time >= data.exit_time) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Entry time must be earlier than exit time.",
            path: ["entry_time"],
        });
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Exit time must be later than entry time.",
            path: ["exit_time"],
        });
    }
});