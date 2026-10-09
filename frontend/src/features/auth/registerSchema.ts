import { z } from "zod";

export const registerSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(1, "First name is required")
            .max(100, "First name must not exceed 100 characters"),

        lastName: z
            .string()
            .trim()
            .min(1, "Last name is required")
            .max(100, "Last name must not exceed 100 characters"),

        email: z
            .string()
            .trim()
            .min(1, "Email is required")
            .pipe(z.email({ error: "Please enter a valid email address" }))
            .pipe(z.string().max(320, "Email must not exceed 320 characters")),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must not exceed 100 characters"),

        confirmPassword: z.string().min(1, "Please confirm your password"),

        preferredCurrency: z
            .string()
            .regex(/^[A-Z]{3}$/, "Select a valid currency"),

        acceptTerms: z.boolean().refine((accepted) => accepted, {
            message: "You must accept the Terms and Privacy Policy",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

export type RegisterFormData = z.infer<typeof registerSchema>;
