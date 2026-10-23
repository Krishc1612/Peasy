import * as z from "zod";

export const createNodeSchema = z.object({
    type: z.enum(["TRIGGER","HTTP_REQUEST","TRANSFORM","CONDITION","DELAY"]),
    subType: z.enum(["MANUAL_TRIGGER", "WEBHOOK_TRIGGER", "CRON_TRIGGER"]).optional(),
    workflowId: z.uuid()
});