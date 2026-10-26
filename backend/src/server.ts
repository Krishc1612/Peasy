import express from 'express';
import dotenv from 'dotenv';
import { Prisma } from './generated/prisma/client.js';

import { createWorkflowSchema, workflowQuerySchema } from './schemas/workflow.schema.js';
import { createWorkflow, deleteWorkflow, getWorkflowById, getWorkflows, patchWorkflow, updateWorkflowGraph } from './repositories/workflowRepo.js';
import { uuidSchema } from './schemas/common.schema.js';
import { graphSchema } from './schemas/graph.schema.js';

dotenv.config()

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "Peasy backend is running!"
    });
})

app.get('/api/workflows/:id', async (req, res) => { // getting workflow thru id
    const result = uuidSchema.safeParse(req.params);

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        });
    }

    const { id } = result.data;
    const userId = "03e43d4b-4f1c-497b-aafe-e9c8f8dbec2d";


    try {
        const workflow = await getWorkflowById(id, userId);

        return res.status(200).json(workflow);
    } catch (error) {
        console.error(error);

        if (error instanceof Error && error.message.startsWith('No workflow with id:')) {
            return res.status(404).json({
                error: `Workflow with id ${id} not found`
            });
        }

        return res.status(500).json({
            error: `failed to get the workflow with id ${ id }`
        })
    }
});

app.get('/api/workflows/', async (req, res) => { // getting workflows with query params like limit, name, page etc
    const result = workflowQuerySchema.safeParse(req.query);

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        });
    }

    const userId = "03e43d4b-4f1c-497b-aafe-e9c8f8dbec2d";
    const { name, sort, orderBy } = result.data;

    const workflows = await getWorkflows(userId, name, sort, orderBy);

    return res.status(200).json(workflows);
})

app.post('/api/workflows/', async (req, res) => { // creating workflow with the given name
    const result = createWorkflowSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        });
    }

    const userId = "03e43d4b-4f1c-497b-aafe-e9c8f8dbec2d";

    try {
        const { name } = result.data;    
        const newWorkflow = await createWorkflow(name, userId);

        return res.status(201).json(newWorkflow);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "failed to create workflow."
        });
    }
})

app.patch('/api/workflows/:id', async (req, res) => { // partially updating the workflow, for now only name could be like that.
    const goodParams = uuidSchema.safeParse(req.params);
    const result = createWorkflowSchema.safeParse(req.body);

    if (!goodParams.success){
        return res.status(400).json({
            errors: goodParams.error.issues
        });
    }

    if (!result.success){
        return res.status(400).json({
            errors: result.error.issues
        })
    }

    const { id } = goodParams.data;
    const { name } = result.data;
    const userId = "03e43d4b-4f1c-497b-aafe-e9c8f8dbec2d";


    try {
        const changedWorkflow = await patchWorkflow(id, name, userId); 

        return res.status(200).json(changedWorkflow);
    } catch (error) {
        console.error(error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return res.status(404).json({
                error: `Workflow with id ${id} not found`
            });
        }

        return res.status(500).json({
            error: "Failed to update the workflow."
        })
    }
})

app.delete('/api/workflows/:id', async (req, res) => {
    const goodParams = uuidSchema.safeParse(req.params);

    if (!goodParams.success){
        return res.status(400).json({
            errors: goodParams.error.issues
        });
    }

    const { id } = goodParams.data;
    const userId = "03e43d4b-4f1c-497b-aafe-e9c8f8dbec2d";
   
    try {
        await deleteWorkflow(id, userId);
        return res.status(204).send();
    } catch (error){
        console.error(error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return res.status(404).json({
                error: `Workflow with id ${id} not found`
            });
        }

        return res.status(500).json({
            error: "Failed to delete the workflow"
        })
    }
});

app.put('/api/workflows/:id/graph', async (req, res) => {
    // console.log(req.body);
    const paramsResult = uuidSchema.safeParse(req.params);
    const graphResult = graphSchema.safeParse(req.body);

    if (!paramsResult.success){
        return res.status(400).json({
            errors: paramsResult.error.issues
        });
    }

    if (!graphResult.success){
        return res.status(400).json({
            errors: graphResult.error.issues
        });
    }

    const { id } = paramsResult.data;
    const userId = "03e43d4b-4f1c-497b-aafe-e9c8f8dbec2d";

    try {
        const workflow = await updateWorkflowGraph(id, userId, graphResult.data);
        return res.status(200).json(workflow);
    } catch (error){
        console.error(error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return res.status(404).json({
                error: `Workflow with id ${id} not found`
            });
        }

        return res.status(500).json({
            error: "Failed to update workflow graph"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`);
})