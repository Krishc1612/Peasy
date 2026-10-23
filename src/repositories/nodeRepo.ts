import { prisma } from '../db/db.js'
import type { Node, NodeSubType, NodeType, Workflow } from '../generated/prisma/client.js';

export async function createNode(
    type: NodeType, 
    subType: NodeSubType | undefined, 
    workflowId: Workflow["id"], 
) {
    const workflowExists: Workflow | null = await prisma.workflow.findUnique({
        where: { id: workflowId }
    });

    if (!workflowExists){
        throw new Error(`Workflow with id: ${workflowId} does not exist`);
    }

    const newNode: Node = await prisma.node.create({
        data: { type, subType, workflowId }
    });

    return newNode;
}