import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string(),
    username: z
        .string()
        .min(4, "Username must be at least 4 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, '_', '-', and '.' allowed"),
    email: z.string().email({message: "Invalid Email Format"}),
    password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be at most 50 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[@$!%*?&]/, "Must contain at least one special character (@$!%*?&)"),

});




export const logInSchema = z.object({
    username: z
        .string()
        .min(4, "Username must be at least 4 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, '_', '-', and '.' allowed"),
    password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be at most 50 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[@$!%*?&]/, "Must contain at least one special character (@$!%*?&)"),

});