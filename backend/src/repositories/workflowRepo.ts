import { prisma } from '../db/db.js'
import type { Workflow } from '../generated/prisma/client.js';
import { Graph } from '../schemas/graph.schema.js';

export async function createWorkflow(
    name: string,
    userId: string
) {
    return await prisma.workflow.create({
        data: { name, userId },
        select: {
            id: true,
            userId: true,
            name: true,
            graphJson: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    })
} 

export async function getWorkflowById(id: Workflow["id"], userId: string) {
    const workflow = await prisma.workflow.findFirst({
        where: { id, userId },
        select: {
            id: true,
            userId: true,
            name: true,
            graphJson: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!workflow){
        throw new Error(`No workflow with id: ${id} exists`);
    }

    return workflow;
}

export async function getWorkflows(
    userId: string,
    name: string | undefined,
    sort: string,
    orderBy: string
){
    const where = {
        userId,
        ...(name
        ? {
            name: {
                startsWith: name,
                mode: "insensitive" as const 
            }
        }
        : {})
    };

    // if name is undefined, where gets empty object. when name is truthy, the object assigned to where would be after the ? one.

    return await prisma.workflow.findMany({
        where,
        orderBy: {
            [orderBy]: sort
        }
    });
}

export async function patchWorkflow(id: string, name: string, userId: string){
    return await prisma.workflow.update({
        where: { id, userId },
        data: { name },
        select: {
            id: true,
            userId: true,
            name: true,
            graphJson: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    }) 
}

export async function deleteWorkflow(id: string, userId: string){
    return await prisma.workflow.delete({ where: { id, userId }});
}

export async function updateWorkflowGraph(
    id: string,
    userId: string,
    graphJson: Graph // note that this is typescript specific schema
) {
    return await prisma.workflow.update({
        where: { id, userId },
        data: { graphJson },
        select: {
            id: true,
            userId: true,
            name: true,
            graphJson: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
}