import * as z from "zod";

const graphNodeSchema = z.strictObject({
    id: z.string().min(1),
    type: z.enum(["http", "trigger", "condition", "transform", "delay"]),
    position: z.strictObject({
        x: z.number(),
        y: z.number()
    }),
    data: z.record(z.string(), z.json())
});

const graphEdgeSchema = z.strictObject({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    sourceHandle: z.string().optional()
});

export const graphSchema = z.strictObject({
    nodes: z.array(graphNodeSchema),
    edges: z.array(graphEdgeSchema)
}).superRefine((graph, context) => {
    const nodes = graph.nodes;
    const edges = graph.edges;

    const uniqueNodeIds = new Set<string>();

    for (const [index, node] of nodes.entries()){
        if (uniqueNodeIds.has(node.id)){
            context.addIssue({
                code: "custom",
                message: `Invalid node ids.`,
                path: ["nodes", index, "id"]
            });
        }

        uniqueNodeIds.add(node.id);
    }

    const uniqueEdgeIds = new Set<string>();
    const uniquePairs = new Set<string>();

    for (const [index, edge] of edges.entries()) {
        const pair = JSON.stringify([edge.source, edge.target]);

        if (uniqueEdgeIds.has(edge.id)) {
            context.addIssue({
                code: "custom",
                message: "Duplicate edge IDs.",
                path: ["edges", index, "id"]
            });
        }

        if (!uniqueNodeIds.has(edge.source) || !uniqueNodeIds.has(edge.target)) {
            context.addIssue({
                code: "custom",
                message: "Invalid references to nodes.",
                path: ["edges", index]
            });
        }

        if (edge.source === edge.target) {
            context.addIssue({
                code: "custom",
                message: "Self-loops are not allowed.",
                path: ["edges", index]
            });
        }

        if (uniquePairs.has(pair)) {
            context.addIssue({
                code: "custom",
                message: "Duplicate edges are not allowed.",
                path: ["edges", index]
            });
        }

        uniqueEdgeIds.add(edge.id);
        uniquePairs.add(pair);
    } 
});

export type Graph = z.infer<typeof graphSchema>;
export type GraphNode = z.infer<typeof graphNodeSchema>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;