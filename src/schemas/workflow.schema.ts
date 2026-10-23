import * as z from "zod";

export const createWorkflowSchema = z.object({
    name: z.string()
        .min(1, "Name cannot be empty")
        .max(100, "Name cannot exceed 100 characters")
})