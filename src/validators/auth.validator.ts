import { z } from "zod";

export const authSchema = z.object({
    username: z.string()
                .min(3, "Username must have at least 3 characters.")
                .max(100, "Username must not exceed 100 characters.")
                .nonempty("Username is required."),
    password: z.string()
                .min(6, "Password must have at least 6 characters.")
                .max(100, "Password must not exceed 100 characters.")
                .nonempty("Password is required."),
});