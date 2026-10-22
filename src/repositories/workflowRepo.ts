import { prisma } from '../db/db.js'
import type { Workflow } from '../generated/prisma/client.js';

export async function createWorkflow(name: string): Promise<Workflow> {
    console.time("Prisma create");

    const newWorkflow: Workflow = await prisma.workflow.create({
        data: { name }
    })

    console.timeEnd("Prisma create"); // 1.2s-1.5s

    // console.log("Created workflow: ", newWorkflow);
    return newWorkflow;
} 