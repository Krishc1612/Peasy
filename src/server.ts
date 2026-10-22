import express from 'express';
import dotenv from 'dotenv';

import type { Workflow } from './workflow.js';
import { createWorkflow } from './workflow.js';

dotenv.config()

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "Peasy backend is running!"
    });
})

app.post('/api/workflow/create', (req, res) => {
    const { name } = req.body;

    if (typeof name !== "string"){
        return res.status(400).json({
            message: `Invalid request: 'name' must be a string.`
        });
    }
    else {
        const newWorkflow: Workflow = createWorkflow(name);
        res.status(201).json(newWorkflow);
    }
})

app.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`);
})