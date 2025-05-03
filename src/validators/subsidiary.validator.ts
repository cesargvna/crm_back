import { z } from "zod";

export const subsidiarySchema = z.object({
    name: z
        .string()
        .min(2, "Name must have at least 2 characters.")
        .max(100, "Name must not exceed 100 characters.")
        .nonempty("Name is required."),

    ci_nit: z
        .string()
        .max(50, "CI/NIT must not exceed 50 characters.")
        .nonempty("CI/NIT is required."),

    address: z
        .string()
        .max(100, "Address must not exceed 100 characters.")
        .optional()
        .nullable(),

    city: z
        .string()
        .max(50, "City must not exceed 50 characters.")
        .optional()
        .nullable(),

    country: z
        .string()
        .max(50, "Country must not exceed 50 characters.")
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
        .regex(/^[+\d][\d\s]*$/, "Cellphone number must contain only digits, spaces, or start with '+'.")
        .optional()
        .nullable(),

    email: z
        .string()
        .email("Invalid email format.")
        .max(80, "Email must not exceed 80 characters.")
        .optional()
        .nullable(),

    status: z.boolean().optional(),
});