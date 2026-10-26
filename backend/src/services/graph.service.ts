import { createHash } from "node:crypto";
import type { Graph } from "../schemas/graph.schema.js";

export function buildGraphData(
    graph: Graph
) {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const node of graph.nodes){
        inDegree.set(node.id, 0);
    }

    for (const edge of graph.edges){
        inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
    }

    for (const node of graph.nodes){
        adjList.set(node.id, []);
    }

    for (const edge of graph.edges){
        adjList.get(edge.source)!.push(edge.target);
    }

    return { inDegree, adjList };
}

export function hasCycle(
    graph: Graph,
    inDegree: Map<string, number>,
    adjList: Map<string, string[]>
): boolean {
    const processed = new Set<string>();
    const queue = new Array<string>();

    let front = 0;

    for (const [node, degree] of inDegree){
        if (degree === 0) {
            queue.push(node);
            processed.add(node);
        }
    }

    while (front < queue.length){
        const u = queue[front++];

        for (const node of adjList.get(u)!){
            inDegree.set(node, inDegree.get(node)! - 1);

            if (inDegree.get(node)! === 0){
                queue.push(node);
                processed.add(node);
            }
        }
    }

    return processed.size !== graph.nodes.length;
}

export function analyze(graph: Graph){
    const { inDegree, adjList } = buildGraphData(graph);

    return {
        inDegree,
        adjList,
        containsCycle: hasCycle(
            graph,
            new Map(inDegree),
            adjList
        )
    }
}

// hashing and sorting 

export function sortObjectKeys(value: any): any{ // hella recursive function
    if (Array.isArray(value)){
        return value.map(sortObjectKeys);
    }

    if (typeof value === "object" && value !== null){
        const keys = Object.keys(value).sort();
        return Object.fromEntries(
            keys.map(key => [key, sortObjectKeys(value[key])])
        );
    }

    return value;
}

export function hashGraph(graph: Graph): string{
    const graphWithoutPos = {
        nodes: graph.nodes
            .map(({ position, ...node }) => node)
            .sort((a, b) => a.id.localeCompare(b.id)),
        edges: graph.edges
            .map(({id, ...edge}) => edge)
            .sort((a, b) => 
                a.source.localeCompare(b.source) ||
                a.target.localeCompare(b.target) || 
                (a.sourceHandle ?? "").localeCompare(b.sourceHandle ?? "")
            )
    };
    // why sort the nodes? to keep the versions EXACTLY the same, we cannot afford the JSON string to be hashed to something else
    // we would need to sort the properties too or make sure the properties are in the same order in every edge and node.

    const serializedGraph = JSON.stringify(sortObjectKeys(graphWithoutPos));

    return createHash("sha256")
        .update(serializedGraph)
        .digest("hex");
}