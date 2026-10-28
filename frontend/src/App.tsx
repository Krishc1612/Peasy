import { useCallback, useEffect, useState } from "react";

import {
  createWorkflow,
  getWorkflow,
  getWorkflows,
  saveWorkflowGraph,
  type Workflow,
  type WorkflowGraph,
} from "./api";

import {
  fromBackendGraph,
  toBackendGraph,
} from "./graphAdapter";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./index.css";

type NodeLabel =
  | "Trigger"
  | "HTTP Request"
  | "Transform"
  | "Condition"
  | "Delay";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface NodeData extends Record<string, unknown> {
  label: NodeLabel;
  url?: string;
  method?: HttpMethod;
  delayMs?: number;
}

type PeasyNode = Node<NodeData, "peasy">;

interface WorkflowDraft {
  workflowName: string;
  nodes: PeasyNode[];
  edges: Edge[];
  workflowId: string | null;
}

const NODE_LABELS: NodeLabel[] = [
  "Trigger",
  "HTTP Request",
  "Transform",
  "Condition",
  "Delay",
];

const STORAGE_KEY = "peasy-draft";

const DEFAULT_NODES: PeasyNode[] = [];
const DEFAULT_EDGES: Edge[] = [];

function loadDraft(): WorkflowDraft {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "nodes" in parsed &&
        "edges" in parsed &&
        Array.isArray(parsed.nodes) &&
        Array.isArray(parsed.edges)
      ) {
        const draft = parsed as Partial<WorkflowDraft>;

       return {
  workflowName:
    typeof draft.workflowName === "string"
      ? draft.workflowName
      : "My Workflow",
  nodes: draft.nodes as PeasyNode[],
  edges: draft.edges as Edge[],
  workflowId:
    typeof draft.workflowId === "string"
      ? draft.workflowId
      : null,
};
      }
    }
  } catch (error) {
    console.error("Could not load the saved draft:", error);
  }

  return {
  workflowName: "My Workflow",
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  workflowId: null,
};
}

function WorkflowNodeCard({
  data,
  selected,
}: NodeProps<PeasyNode>) {
  return (
    <div className={`workflow-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />

      <div className="node-heading">{data.label}</div>

      <div className="node-description">
        {data.label === "Trigger" && "Starts the workflow"}
        {data.label === "HTTP Request" && (data.method ?? "GET")}
        {data.label === "Transform" && "Modify data"}
        {data.label === "Condition" && "Check a condition"}
        {data.label === "Delay" &&
          `${data.delayMs ?? 1000} ms`}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  peasy: WorkflowNodeCard,
} satisfies NodeTypes;

export default function App() {
  const [initialDraft] = useState<WorkflowDraft>(() => loadDraft());

  const [workflowName, setWorkflowName] = useState(
    initialDraft.workflowName
  );

  const [nodes, setNodes, onNodesChange] =
    useNodesState<PeasyNode>(initialDraft.nodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>(initialDraft.edges);

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null);

// Restore the backend workflow ID from the saved browser draft.
const [workflowId, setWorkflowId] =
  useState<string | null>(initialDraft.workflowId);

  const [isSaving, setIsSaving] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [workflowListError, setWorkflowListError] = useState<string | null>(null);
  const [isOpeningWorkflow, setIsOpeningWorkflow] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Unsaved");
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? null;

  const refreshWorkflows = useCallback(async () => {
    setIsLoadingWorkflows(true);
    setWorkflowListError(null);

    try {
      const result = await getWorkflows();
      if (!Array.isArray(result)) {
        throw new Error("The workflows endpoint did not return a list.");
      }
      setWorkflows(result);
    } catch (error) {
      setWorkflowListError(
        error instanceof Error ? error.message : "Could not load workflows."
      );
    } finally {
      setIsLoadingWorkflows(false);
    }
  }, []);

  useEffect(() => {
    void refreshWorkflows();
  }, [refreshWorkflows]);

  async function handleOpenWorkflow(id: string) {
    if (!id || isOpeningWorkflow) return;

    setIsOpeningWorkflow(true);
    setSaveError(null);
    setSaveStatus("Loading selected workflow...");

    try {
      const workflow = await getWorkflow(id);
      let graphData: unknown = workflow.graphJson;

      if (typeof graphData === "string") {
        graphData = JSON.parse(graphData);
      }

      if (
        typeof graphData !== "object" ||
        graphData === null ||
        !("nodes" in graphData) ||
        !("edges" in graphData) ||
        !Array.isArray(graphData.nodes) ||
        !Array.isArray(graphData.edges)
      ) {
        throw new Error("This workflow does not contain a valid graph.");
      }

      const converted = fromBackendGraph(graphData as WorkflowGraph);
      setNodes(converted.nodes as PeasyNode[]);
      setEdges(converted.edges as Edge[]);
      setWorkflowName(workflow.name || "My Workflow");
      setWorkflowId(workflow.id);
      setSelectedNodeId(null);
      setSaveStatus("Loaded from backend");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not open workflow.";
      setSaveStatus("Load failed");
      setSaveError(message);
    } finally {
      setIsOpeningWorkflow(false);
    }
  }

  const addWorkflowNode = (label: NodeLabel) => {
    const id = `node-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const newNode: PeasyNode = {
      id,
      type: "peasy",
      position: {
        x: 150 + Math.random() * 250,
        y: 100 + Math.random() * 250,
      },
      data: {
        label,
        method: "GET",
        delayMs: 1000,
      },
    };

    setNodes((currentNodes) => [...currentNodes, newNode]);
    setSelectedNodeId(id);
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(connection, currentEdges)
      );
    },
    [setEdges]
  );

  function updateSelectedNode(patch: Partial<NodeData>) {
    if (!selectedNodeId) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...patch,
              },
            }
          : node
      )
    );
  }

  function deleteSelectedNode() {
    if (!selectedNodeId) return;

    setNodes((currentNodes) =>
      currentNodes.filter((node) => node.id !== selectedNodeId)
    );

    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          edge.source !== selectedNodeId &&
          edge.target !== selectedNodeId
      )
    );

    setSelectedNodeId(null);
  }

  function validateWorkflow(): string[] {
    const errors: string[] = [];

    if (nodes.length === 0) {
      errors.push("Add at least one node.");
    }

    for (const node of nodes) {
      if (
        node.data.label === "HTTP Request" &&
        !node.data.url?.trim()
      ) {
        errors.push(
          `HTTP Request "${node.id}" needs a URL.`
        );
      }

      if (
        node.data.label === "Delay" &&
        (
          node.data.delayMs == null ||
          !Number.isFinite(node.data.delayMs) ||
          node.data.delayMs < 0
        )
      ) {
        errors.push(
          `Delay "${node.id}" needs a valid duration.`
        );
      }
    }

    return errors;
  }

  // This format is used only for downloading a JSON file.
  // Backend saving uses toBackendGraph() instead.
  function buildWorkflow() {
    return {
      name: workflowName,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.label
          .toUpperCase()
          .replaceAll(" ", "_"),
        position: node.position,
        config: {
          ...(node.data.url !== undefined && {
            url: node.data.url,
          }),
          ...(node.data.method !== undefined && {
            method: node.data.method,
          }),
          ...(node.data.delayMs !== undefined && {
            delayMs: node.data.delayMs,
          }),
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    };
  }

  function exportWorkflow() {
    const errors = validateWorkflow();

    if (errors.length > 0) {
      alert(
        "Please fix these issues first:\n\n" +
          errors.map((error) => `• ${error}`).join("\n")
      );
      return;
    }

    const json = JSON.stringify(buildWorkflow(), null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "peasy-workflow.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleSave() {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveStatus("Saving...");

    try {
      // Validate the frontend's basic node configuration first.
      const errors = validateWorkflow();

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }

      // Create a backend workflow on the first save.
      let id = workflowId;

      if (!id) {
        const created = await createWorkflow(
          workflowName.trim() || "My Workflow"
        );

        id = created.id;
        setWorkflowId(id);
      }

      // Convert React Flow objects into the backend's schema.
      const graph = toBackendGraph(nodes, edges);

      // Save the graph against the existing workflow ID.
      await saveWorkflowGraph(id, graph);

      setSaveStatus("Saved");
      await refreshWorkflows();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      setSaveError(message);
      setSaveStatus("Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  // Keep a local browser draft independently of backend persistence.
 useEffect(() => {
  const draft: WorkflowDraft = {
    workflowName,
    nodes,
    edges,
    workflowId,
  };

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(draft)
    );
  } catch (error) {
    console.error("Could not save the draft:", error);
  }
}, [workflowName, nodes, edges, workflowId]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <div>
            <h1>Peasy</h1>
            <p>Workflow Builder</p>
          </div>
        </div>

        <div className="workflow-title">
          <label htmlFor="workflow-name">Workflow name</label>
          <input
            id="workflow-name"
            value={workflowName}
            onChange={(event) => {
              setWorkflowName(event.target.value);
              setSaveStatus("Unsaved");
            }}
            placeholder="My Workflow"
          />
        </div>

        <div className="workflow-title">
          <label htmlFor="open-workflow">Open workflow</label>
          <select
            id="open-workflow"
            value={workflowId ?? ""}
            disabled={isLoadingWorkflows || isOpeningWorkflow}
            onChange={(event) => void handleOpenWorkflow(event.target.value)}
          >
            <option value="">
              {isLoadingWorkflows ? "Loading workflows..." : "Select a workflow"}
            </option>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name || "Untitled workflow"}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="node-add-button"
            onClick={() => void refreshWorkflows()}
            disabled={isLoadingWorkflows || isOpeningWorkflow}
          >
            {isLoadingWorkflows ? "Refreshing..." : "Refresh list"}
          </button>
        </div>

        <button
          className="primary-button"
          onClick={exportWorkflow}
        >
          Validate &amp; Export JSON
        </button>

        <button
          className="primary-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save to Peasy"}
        </button>

        <span role="status">{saveStatus}</span>

        {saveError && (
          <p role="alert" className="save-error">
            {saveError}
          </p>
        )}
        {workflowListError && (
          <p role="alert" className="save-error">
            Could not load workflow list: {workflowListError}
          </p>
        )}
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <h2>Nodes</h2>
          <p className="muted">
            Click a node to add it to the canvas.
          </p>

          {NODE_LABELS.map((label) => (
            <button
              className="node-add-button"
              key={label}
              onClick={() => {
                addWorkflowNode(label);
                setSaveStatus("Unsaved");
              }}
            >
              <span className="plus">+</span>
              {label}
            </button>
          ))}

          <div className="sidebar-tip">
            <strong>Quick guide</strong>
            <p>Drag nodes to arrange them.</p>
            <p>
              Connect the right handle of one node to the
              left handle of another.
            </p>
            <p>Select a node to configure or delete it.</p>
          </div>
        </aside>

        <main className="canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              if (changes.length > 0) setSaveStatus("Unsaved");
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              if (changes.length > 0) setSaveStatus("Unsaved");
            }}
            onConnect={(connection) => {
              onConnect(connection);
              setSaveStatus("Unsaved");
            }}
            onNodeClick={(_, node) =>
              setSelectedNodeId(node.id)
            }
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </main>

        <aside className="config-panel">
          <h2>Configuration</h2>

          {!selectedNode ? (
            <p className="muted">
              Select a node on the canvas to edit its settings.
            </p>
          ) : (
            <>
              <p className="selected-label">
                Selected: {selectedNode.data.label}
              </p>

              <label htmlFor="node-label">Node name</label>
              <input
                id="node-label"
                value={selectedNode.data.label}
                readOnly
              />

              {selectedNode.data.label === "HTTP Request" && (
                <>
                  <label htmlFor="http-method">Method</label>
                  <select
                    id="http-method"
                    value={selectedNode.data.method ?? "GET"}
                    onChange={(event) => {
                      updateSelectedNode({
                        method: event.target.value as HttpMethod,
                      });
                      setSaveStatus("Unsaved");
                    }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <label htmlFor="http-url">Request URL</label>
                  <input
                    id="http-url"
                    type="url"
                    value={selectedNode.data.url ?? ""}
                    onChange={(event) => {
                      updateSelectedNode({
                        url: event.target.value,
                      });
                      setSaveStatus("Unsaved");
                    }}
                    placeholder="https://api.example.com"
                  />

                  <p className="field-help">
                    Enter the endpoint this request should call.
                  </p>
                </>
              )}

              {selectedNode.data.label === "Delay" && (
                <>
                  <label htmlFor="delay-ms">
                    Delay duration (milliseconds)
                  </label>
                  <input
                    id="delay-ms"
                    type="number"
                    min="0"
                    value={selectedNode.data.delayMs ?? 1000}
                    onChange={(event) => {
                      updateSelectedNode({
                        delayMs:
                          event.target.value === ""
                            ? undefined
                            : Number(event.target.value),
                      });
                      setSaveStatus("Unsaved");
                    }}
                  />
                </>
              )}

              {selectedNode.data.label === "Trigger" && (
                <p className="field-help">
                  This node represents the start of the workflow.
                  Trigger behavior must be implemented by the backend.
                </p>
              )}

              {selectedNode.data.label === "Transform" && (
                <p className="field-help">
                  This node represents a data transformation.
                  Transformation rules are not implemented yet.
                </p>
              )}

              {selectedNode.data.label === "Condition" && (
                <p className="field-help">
                  This node represents a condition.
                  Condition rules and branching are not implemented yet.
                </p>
              )}

              <button
                className="danger-button"
                onClick={() => {
                  deleteSelectedNode();
                  setSaveStatus("Unsaved");
                }}
              >
                Delete node
              </button>
            </>
          )}
        </aside>
      </div>

      <footer className="statusbar">
        <span>{nodes.length} nodes</span>
        <span>{edges.length} connections</span>
        <span>Draft autosaves in this browser</span>
        <span>
          {workflowId
            ? `Backend ID: ${workflowId}`
            : "Not saved to backend yet"}
        </span>
      </footer>
    </div>
  );
}