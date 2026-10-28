import { getWorkflowById } from "../repositories/workflowRepo.js";
import { createWorkflowVersion, getWorkflowVersion } from "../repositories/workflowVersionRepo.js";
import { graphSchema } from "../schemas/graph.schema.js";
import { hashGraph } from "./graph.service.js";
import { validateWorkflow } from "./workflowValidator.service.js";

export const prepareWorkflowVersion = async (
    workflowId: string,
    userId: string
) => {  
    const workflow = await getWorkflowById(workflowId, userId);
    const graph = graphSchema.parse(workflow.graphJson); // this is kinda redundant (to validate draft), just doing to gain Graph type. (according to me).

    validateWorkflow(graph);

    const hash = hashGraph(graph);
    // console.log(`For workflowId: ${workflowId}, hash came out to be: ${hash}`);

    let versionExists = await getWorkflowVersion(workflowId, hash);

    if (!versionExists){
        versionExists = await createWorkflowVersion(workflowId, hash, graph);
    }

    // console.log(`workflowVersion fetched: ${versionExists}`);

    const workflowVersion = versionExists;
    return workflowVersion;
}