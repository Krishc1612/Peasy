import * as z from "zod";

export const uuidSchema = z.strictObject({
    id: z.uuid()
});

export const idempotencyKeySchema = z
    .string()
    .trim()
    .min(1)
    .max(255)
    .optional();

export type uuid = z.infer<typeof uuidSchema>;