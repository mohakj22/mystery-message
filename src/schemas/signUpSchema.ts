import { z } from "zod";
export const usernameValidation = z
  .string()
  .min(2, "Username must be atleast 2 characters")
  .max(10, "must be no more than 10 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username not in valid format");

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be atleast 8 characters" })
    .max(20, { message: "Password must not be more than 20 characters" }),
});
  