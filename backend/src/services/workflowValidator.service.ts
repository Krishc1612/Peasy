import type { Graph, GraphNode } from "../schemas/graph.schema.js";
import { analyze, buildGraphData } from "./graph.service.js";

export function areNodesReachable(
    graph: Graph,
    source: GraphNode 
){
    const { adjList } = buildGraphData(graph); 

    const visited = new Set<string>();
    const bfsQ = new Array<string>();

    bfsQ.push(source.id);
    visited.add(source.id);

    let front = 0;

    while (front < bfsQ.length){
        const u = bfsQ[front++];

        for (const node of adjList.get(u)!){
            if (!visited.has(node)){
                visited.add(node);
                bfsQ.push(node);
            }
        }
    }

    for (const node of graph.nodes){
        if (!visited.has(node.id)){
            return false;
        }
    }

    return true;
}

export function getTriggers(graph: Graph): GraphNode[] {
    return graph.nodes.filter(node => node.type === "trigger");
}

export function validateWorkflow(graph: Graph): void {
    const triggers = getTriggers(graph);

    if (triggers.length !== 1) {
        throw new Error("Graph must have a single trigger.");
    }

    const trigger = triggers[0]!;

    if (!areNodesReachable(graph, trigger)) {
        throw new Error("All nodes must be reachable from trigger.");
    }

    const { containsCycle } = analyze(graph);

    if (containsCycle) {
        throw new Error("Graph must not have any cycles.");
    }
}