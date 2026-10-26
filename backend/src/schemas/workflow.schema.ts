import * as z from "zod";

export const createWorkflowSchema = z.strictObject({
    name: z.string()
        .min(1, "Name cannot be empty")
        .max(100, "Name cannot exceed 100 characters")
})

export const workflowQuerySchema = z.strictObject({
    name: createWorkflowSchema.shape.name.optional(),
    orderBy: z.enum(["name", "createdAt"]).default("createdAt"),
    sort: z.enum(["asc", "desc"]).default("desc")
});

export type workflowQuery = z.infer<typeof workflowQuerySchema>;