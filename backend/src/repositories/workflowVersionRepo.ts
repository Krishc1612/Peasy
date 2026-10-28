import { prisma } from "../db/db.js";
import { Graph } from "../schemas/graph.schema.js";

export const getWorkflowVersion = async (
    workflowId: string,
    hash: string,
) => {
    return await prisma.workflowVersion.findUnique({
        where: {
            workflowId_hash: {
                workflowId,
                hash
            }
        }
    });
}

export const createWorkflowVersion = async (
    workflowId: string,
    hash: string,
    graphJson: Graph
) => {
    const latestVersion = await prisma.workflowVersion.aggregate({
        where: { workflowId },
        _max: {
            version: true
        }
    }); // would return null if no workflowVersion is found with given workflowId 

    const nextVersion = (latestVersion._max.version ?? 0) + 1;

    return await prisma.workflowVersion.create({
        data: {
            workflowId,
            hash,
            graphJson,
            version: nextVersion
        }
    });
}