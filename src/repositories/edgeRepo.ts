import { prisma } from '../db/db.js'
import type { Node, Edge } from '../generated/prisma/client.js';

export async function createEdge(
    source: Node["id"],
    target: Node["id"]
) {
    const nodeIds: Node["id"][] = [source, target];

    const foundNodes = await prisma.node.findMany({
        where: {
            id: { in: nodeIds }
        }
    });

    if (foundNodes.length < 2){
        throw new Error(`Invalid source/target entries for the creation of edge.`);
    }

    const newEdge: Edge = await prisma.edge.create({
        data: { source, target }
    });

    return newEdge;
}