import express from 'express';
import dotenv from 'dotenv';

import type { Workflow, Node, Edge } from './generated/prisma/client.js';
import { createWorkflow } from './repositories/workflowRepo.js';
import { createNode } from './repositories/nodeRepo.js';
import { createEdge } from './repositories/edgeRepo.js';

dotenv.config()

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "Peasy backend is running!"
    });
})

app.post('/api/workflow/create', async (req, res) => {
    const { name } = req.body;

    if (typeof name !== "string"){
        return res.status(400).json({
            message: `Invalid request: 'name' must be a string.`
        });
    }
    // more validations like these maybe on string length and so on..

    console.time("Repository call");
    
    const newWorkflow: Workflow = await createWorkflow(name);

    console.timeEnd("Repository call");
    return res.status(201).json(newWorkflow);
})

app.post('/api/node/create', async (req, res) => {
    const { type, subType, workflowId } = req.body;

    // some validations first then,
    const newNode: Node = await createNode(type, subType, workflowId);
    return res.status(201).json(newNode);
})

app.post('/api/edge/create', async (req, res) => {
    const { source, target } = req.body;

    // also some validations
    const newEdge: Edge = await createEdge(source, target);
    return res.status(201).json(newEdge);
})

app.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`);
})