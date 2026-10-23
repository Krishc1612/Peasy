import * as z from "zod";

export const createEdgeSchema = z.object({
    source: z.uuid(),
    target: z.uuid()
});