import type { Edge, Node } from "@xyflow/react";
import type {
  BackendNodeType,
  WorkflowGraph,
} from "./api";

const typeMap: Record<string, BackendNodeType> = {
  Trigger: "trigger",
  "HTTP Request": "http",
  Transform: "transform",
  Condition: "condition",
  Delay: "delay",
};

const labelMap: Record<BackendNodeType, string> = {
  trigger: "Trigger",
  http: "HTTP Request",
  transform: "Transform",
  condition: "Condition",
  delay: "Delay",
};

export function toBackendGraph(
  nodes: Node[],
  edges: Edge[]
): WorkflowGraph {
  return {
    nodes: nodes.map((node) => {
      const label = String(node.data.label ?? "");
      const type = typeMap[label];

      if (!type) {
        throw new Error(`Unsupported node label: ${label}`);
      }

      return {
        id: node.id,
        type,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        data: node.data as Record<string, unknown>,
      };
    }),

    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      ...(edge.sourceHandle
        ? { sourceHandle: edge.sourceHandle }
        : {}),
    })),
  };
}

export function fromBackendGraph(graph: WorkflowGraph): {
  nodes: Node[];
  edges: Edge[];
} {
  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      type: "peasy",
      position: {
        x: node.position.x,
        y: node.position.y,
      },
      data: {
        ...node.data,
        label: labelMap[node.type],
      },
    })),

    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      ...(edge.sourceHandle
        ? { sourceHandle: edge.sourceHandle }
        : {}),
    })),
  };
}
