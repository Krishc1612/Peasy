// // // function WorkFlowCard(props){
// // //   return (
// // //     <div>
// // //       <h2>{props.title}</h2>
// // //       <p>{props.description}</p>
// // //     </div>
// // //   );
// // // }

// // // function App(){
// // //   function handleClick(){
// // //     alert("Trigger button clicked!");
// // //   }
// // //   function clickHandle(){
// // //     alert("Workflow started!.")
// // //   }

// // //   return(
// // //     <div>
// // //       <h1>Peasy Workflow Builder</h1>
// // //       {/* If we write onclick = handleClick() it would call is directly during rendering without waitng for click  */}
// // //       <button onClick={handleClick}>
// // //         Add Trigger
// // //       </button>
// // //        <button onClick={clickHandle}>
// // //        Run Workflow
// // //       </button>
// // //      <WorkFlowCard
// // //      title = "Trigger"
// // //      description = "Starts the workflow"/>
// // //        <WorkFlowCard
// // //      title = "HTTP Request"
// // //      description = "Fetches data from an API"/>
// // //       <WorkFlowCard
// // //      title = "Condition"
// // //      description = "Checks whether a condition is true"/>


// // //     </div>
// // //   );
// // // }
// // // export default App;

// // // import { useState } from "react";

// // // function App(){
// // //   const [count,setCount] = useState(0);
// // //   function handleAddTrigger(){
// // //     setCount(count+1);
// // //   }
// // //   return (
// // //     <div>
// // //       <h1>Counter: {count}</h1>
// // //       <button onClick={handleAddTrigger}>
// // //         Increase
// // //       </button>
// // //     </div>
// // //   );
// // // }

// // // export default App;

// // // 

// // // function App(){
// // //   const [count,setCount] = useState(0);
// // //   function addTrigger(){
// // //     setCount(prevCnt=>prevCnt+1);
// // //   }
// // //   function resetTrigger(){
// // //     setCount(0);
// // //   }
// // //   return (
// // //     <div>
// // //     <h1>Counter: {count}</h1>
// // //     <button onClick={addTrigger}>
// // //       Add Trigger
// // //     </button>
// // //       <button onClick={resetTrigger}>
// // //       Reset
// // //     </button>
// // //      {count === 0 ? (
// // //         <p>No nodes added yet</p>
// // //       ) : (
// // //         <p>Nodes on canvas: {count}</p>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // // function App(){
// // //   const [nodes,addNodes] = useState([]);
// // //   function addTriggerB(){
// // //     addNodes(previousNodes=>[...previousNodes,"Trigger"]);
// // //   }
// // //   function addHTTPB(){
// // //     addNodes(previousNodes=>[...previousNodes,"HTTP request"]);
// // //   }
// // //   function reset(){
// // //   addNodes([]);
// // //   }
// // //   return (
// // //     <div>
// // //     <button onClick={addTriggerB}>
// // //       Add Trigger
// // //     </button>
// // //     <button onClick={addHTTPB}>
// // //       Add HTTP request
// // //     </button>
// // //     <button onClick={reset}>
// // //       Reset
// // //     </button>
// // //     {nodes.length==0?(
// // //       <p>No nodes added yet</p>
// // //     ):
// // //     (
// // //       nodes.map(node=>(
// // //         <p key = {node}>{node}</p>
// // //       ))
// // //     )}
// // //     </div>
// // //   );
// // // }

// // import { useState } from "react";

// // // function App() {
// // //   const [nodes, setNodes] = useState([]);
// // //   const [nextId, setNextId] = useState(1);

// // //   function addTrigger() {
// // //     const newNode = {
// // //       id: nextId,
// // //       type: "Trigger"
// // //     };

// // //     setNodes(previousNodes => [...previousNodes, newNode]);
// // //     setNextId(previousId => previousId + 1);
// // //   }

// // //   function addHTTP() {
// // //     const newNode = {
// // //       id: nextId,
// // //       type: "HTTP Request"
// // //     };

// // //     setNodes(previousNodes => [...previousNodes, newNode]);
// // //     setNextId(previousId => previousId + 1);
// // //   }

// // //   function deleteButton(idToDelete) {
// // //     setNodes(previousNodes =>
// // //       previousNodes.filter(node => node.id !== idToDelete)
// // //     );
// // //   }

// // //   function reset() {
// // //     setNodes([]);
// // //     setNextId(1);
// // //   }

// // //   return (
// // //     <div>
// // //       <h1>Peasy Workflow Builder</h1>

// // //       <button onClick={addTrigger}>Add Trigger</button>
// // //       <button onClick={addHTTP}>Add HTTP Request</button>
// // //       <button onClick={reset}>Reset</button>

// // //       {nodes.length === 0 ? (
// // //         <p>No nodes added yet</p>
// // //       ) : (
// // //         nodes.map(node => (
// // //           <div key={node.id}>
// // //             <p>
// // //               {node.type} - ID: {node.id}
// // //             </p>

// // //             <button onClick={() => deleteButton(node.id)}>
// // //               Delete
// // //             </button>
// // //           </div>
// // //         ))
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default App;




// // function App() {
// //   const [apiUrl, setApiUrl] = useState("");
// //   const [savedUrl, setSavedUrl] = useState("");

// //   function handleSubmit(event) {
// //     event.preventDefault();

// //     if (apiUrl.trim() === "") {
// //       alert("Please enter an API URL");
// //       return;
// //     }

// //     setSavedUrl(apiUrl);
// //   }

// //   return (
// //     <div>
// //       <h1>Peasy Workflow Builder</h1>

// //       <h2>HTTP Request Configuration</h2>

// //       <form onSubmit={handleSubmit}>
// //         <label htmlFor="apiUrl">API URL: </label>

// //         <input
// //           id="apiUrl"
// //           type="text"
// //           value={apiUrl}
// //           onChange={(event) => setApiUrl(event.target.value)}
// //           placeholder="https://example.com/api"
// //         />

// //         <button type="submit">Save Configuration</button>
// //       </form>

// //       {savedUrl && (
// //         <p>Saved API URL: {savedUrl}</p>
// //       )}
// //     </div>
// //   );
// // }

// // export default App;


// import { useState } from "react";

// function Toolbar({ onAddNode }) {
//   return (
//     <div>
//       <button onClick={onAddNode}>
//         Add Trigger
//       </button>
//     </div>
//   );
// }

// function App() {
//   const [nodes, setNodes] = useState([]);

//   function addTrigger() {
//     const newNode = {
//       id: Date.now(),
//       type: "Trigger"
//     };

//     setNodes(previousNodes => [...previousNodes, newNode]);
//   }

//   return (
//     <div>
//       <h1>Peasy Workflow Builder</h1>

//       <Toolbar onAddNode={addTrigger} />

//       <p>Nodes: {nodes.length}</p>

//       {nodes.map(node => (
//         <p key={node.id}>{node.type}</p>
//       ))}
//     </div>
//   );
// }

// export default App;

// type NodeType = 
// | "TRIGGER"
// | "HTTP REQUEST"
// | "TRANSFORM"
// | "CONDITION"
// | "DELAY"

// interface WorkflowNode {
//     id: number,
//     type: NodeType,
//     isSelected?: boolean //optinal ? ye dalna hota h
// }
// const node: WorkflowNode = {
//     id: 1,
//     type: "TRIGGER",
//     isSelected: false
// }
// const node2: WorkflowNode = {
//     id: 2,
//     type: "HTTP REQUEST",
//     isSelected: false
// }
// function App() {
//   return (
//     <div>
//       <h1>Peasy Workflow Builder</h1>
//       <p>React Flow setup is ready!</p>
//     </div>
//   );
// }

// export default App;


import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Trigger" },
    type: "default",
  },
  {
    id: "2",
    position: { x: 400, y: 100 },
    data: { label: "HTTP Request" },
    type: "default",
  },
];

const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(connection, currentEdges)
      );
    },
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h2 style={{ position: "absolute", zIndex: 10, margin: 12 }}>
        Peasy Workflow Builder
      </h2>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
