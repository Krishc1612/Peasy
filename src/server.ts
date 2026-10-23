import express from 'express';
import dotenv from 'dotenv';

import type { Workflow, Node, Edge } from './generated/prisma/client.js';
import { createWorkflow } from './repositories/workflowRepo.js';
import { createNode } from './repositories/nodeRepo.js';
import { createEdge } from './repositories/edgeRepo.js';
import { createWorkflowSchema } from './schemas/workflow.schema.js';
import { createNodeSchema } from './schemas/node.schema.js';
import { createEdgeSchema } from './schemas/edge.schema.js';

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
    const result = createWorkflowSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        });
    }

    const { name } = result.data;    
    const newWorkflow: Workflow = await createWorkflow(name);

    console.timeEnd("Repository call");
    return res.status(201).json(newWorkflow);
})

app.post('/api/node/create', async (req, res) => {
    const result = createNodeSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        });
    }

    const { type, subType, workflowId } = result.data;

    // some validations first then,
    const newNode: Node = await createNode(type, subType, workflowId);
    return res.status(201).json(newNode);
})

app.post('/api/edge/create', async (req, res) => {
    const result = createEdgeSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        });
    }

    const { source, target } = result.data;

    // also some validations
    const newEdge: Edge = await createEdge(source, target);
    return res.status(201).json(newEdge);
})

app.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`);
})