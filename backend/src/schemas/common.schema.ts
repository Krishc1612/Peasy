import * as z from "zod";

export const uuidSchema = z.strictObject({
    id: z.uuid()
});

export type uuid = z.infer<typeof uuidSchema>;