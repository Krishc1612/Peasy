import { prisma } from "../db/db.js";
import { GraphNode } from "../schemas/graph.schema.js";

export const createExecution = async (
    workflowId: string,
    versionId: string,
    idempotencyKey: string,
    trigger: string,
    payload?: object
) => {
    return await prisma.execution.create({
        data: {
            workflowId,
            versionId,
            idempotencyKey,
            trigger,
            payload,
            status: "QUEUED"
        }
    });
}

export const createNodeExecutions = async (
    executionId: string,
    nodes: GraphNode[],
    inDegree: Map<string, number>,
    adjList: Map<string, string[]>
) => {
    return await prisma.nodeExecution.createMany({
        data: nodes.map(node => ({
            executionId,
            nodeId: node.id,
            status: "PENDING",
            pendingParents: inDegree.get(node.id)!,
            childrenIds: adjList.get(node.id)!
        }))
    });
}