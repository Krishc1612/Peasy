import { randomUUID } from "node:crypto";
import { prepareWorkflowVersion } from "./workflowVersion.service.js"
import { createExecution, createNodeExecutions } from "../repositories/executionRepo.js";
import { getTriggers } from "./workflowValidator.service.js";
import { graphSchema } from "../schemas/graph.schema.js";
import { analyze } from "./graph.service.js";

export const executeWorkflow = async (
    workflowId: string,
    userId: string,
    idempotencyKey: string | undefined,
    triggerSource: "manual" | "cron" | "webhook"
) => {
    idempotencyKey = idempotencyKey ?? randomUUID();
    const workflowVersion = await prepareWorkflowVersion(workflowId, userId);

    const graph = graphSchema.parse(workflowVersion.graphJson);
    
    // TODO: make sure to pack execution init and nodeExecutions init to be in same transaction 
    // if node execution do not exist for some nodes and does for some it would be catastrophic
    const newExecution = await createExecution(workflowId, workflowVersion.id, idempotencyKey, triggerSource);
    const { inDegree, adjList } = analyze(graph);

    const nodeExecutions = await createNodeExecutions(
        newExecution.id,
        graph.nodes,
        inDegree,
        adjList
    );

    const trigger = getTriggers(graph)[0]!; // the one and only trigger is the only node with incoming edges = 0

    

    // console.log("Idempotency-key used: ", idempotencyKey);
    // console.log("Execution created:", newExecution.id);
    // console.log("Workflow version:", workflowVersion.id);
    // console.log("Node executions created:", nodeExecutions);
}