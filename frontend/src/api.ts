
export type BackendNodeType =
  | "http"
  | "trigger"
  | "condition"
  | "transform"
  | "delay";

export interface GraphNode {
  id: string;
  type: BackendNodeType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface WorkflowGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Workflow {
  id: string;
  name: string;
  graphJson: WorkflowGraph | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error ??
        `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function createWorkflow(name: string) {
  return request<Workflow>("/workflows/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getWorkflow(id: string) {
  return request<Workflow>(
    `/workflows/${encodeURIComponent(id)}`
  );
}

export function getWorkflows() {
  return request<Workflow[]>("/workflows/");
}

export function renameWorkflow(id: string, name: string) {
  return request<Workflow>(
    `/workflows/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }
  );
}

export function saveWorkflowGraph(
  id: string,
  graph: WorkflowGraph
) {
  return request<Workflow>(
    `/workflows/${encodeURIComponent(id)}/graph`,
    {
      method: "PUT",
      body: JSON.stringify(graph),
    }
  );
}

export function deleteWorkflow(id: string) {
  return request<void>(
    `/workflows/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
