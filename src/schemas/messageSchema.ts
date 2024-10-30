import { z } from "zod";
export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be at least of 15 characters" })
    .max(250, { message: "Content must be at most of 250 characters" }),
});
