// define what a workflow shall be
// define what a node shall be
// define what an edge shall be
// try creating workflows and returning them as response

let nextWorkflowId: number = 1;

export interface Node {
    id: number,
    type: string
}

export interface Edge {
    id: number,
    source: Node["id"],
    target: Node["id"]
}

export interface Workflow {
    id: number,
    name: string,
    nodes: Node[],
    edges: Edge[]
}

export function createWorkflow(name: string): Workflow{
    const newWorkflow: Workflow = {
        id: nextWorkflowId++,
        name: name,
        nodes: [],
        edges: []
    } 

    return newWorkflow;
}