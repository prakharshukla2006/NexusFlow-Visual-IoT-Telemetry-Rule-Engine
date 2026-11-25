import { Router, Request, Response } from 'express';
import { validateWorkflowGraph, WorkflowGraph } from '../services/workflowValidator.js';
import {
  WorkflowExecutionRegistry,
  compileGraphToPipeline,
  TelemetryStreamEvent,
} from '../services/reactiveStreamEngine.js';

const router = Router();
const engine = WorkflowExecutionRegistry.getInstance();

// In-memory store for validated workflows
export const workflowRegistry: Map<string, WorkflowGraph> = new Map();

// Seed initial default workflow
const defaultWorkflow: WorkflowGraph = {
  workflowId: 'wf-turb-temp-default',
  name: 'Turbine Bearing High Temp Protection',
  version: '1.0.0',
  nodes: [
    { id: 'src-1', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' }, position: { x: 50, y: 150 } },
    { id: 'ma-1', type: 'movingAverage', data: { windowSize: 5 }, position: { x: 280, y: 150 } },
    { id: 'thresh-1', type: 'thresholdCheck', data: { operator: '>', limit: 85.0 }, position: { x: 520, y: 150 } },
    { id: 'act-1', type: 'actionAlert', data: { severity: 'critical', actionType: 'webhook', destination: 'https://api.factory.internal/alerts' }, position: { x: 760, y: 150 } },
  ],
  edges: [
    { id: 'e1-2', source: 'src-1', target: 'ma-1' },
    { id: 'e2-3', source: 'ma-1', target: 'thresh-1' },
    { id: 'e3-4', source: 'thresh-1', target: 'act-1' },
  ],
};

workflowRegistry.set(defaultWorkflow.workflowId, defaultWorkflow);
engine.registerWorkflow(defaultWorkflow);

// POST /api/workflows/validate - Validate a React Flow workflow graph JSON without saving
router.post('/workflows/validate', (req: Request, res: Response) => {
  const graph = req.body as WorkflowGraph;
  const result = validateWorkflowGraph(graph);

  if (!result.valid) {
    return res.status(400).json({
      status: 'error',
      message: 'Workflow graph validation failed',
      errors: result.errors,
      warnings: result.warnings,
    });
  }

  res.json({
    status: 'success',
    message: 'Workflow graph is structurally valid and DAG compliant',
    nodeCount: result.nodeCount,
    edgeCount: result.edgeCount,
    executionOrder: result.executionOrder,
    warnings: result.warnings,
  });
});

// POST /api/workflows - Validate and register a new workflow
router.post('/workflows', (req: Request, res: Response) => {
  const graph = req.body as WorkflowGraph;
  const result = validateWorkflowGraph(graph);

  if (!result.valid) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot register invalid workflow',
      errors: result.errors,
    });
  }

  workflowRegistry.set(graph.workflowId, graph);

  res.status(201).json({
    status: 'created',
    message: `Workflow "${graph.name}" registered successfully`,
    workflowId: graph.workflowId,
    executionOrder: result.executionOrder,
  });
});

// POST /api/workflows/:id/deploy - Compile into active reactive stream execution engine
router.post('/workflows/:id/deploy', (req: Request, res: Response) => {
  const id = req.params.id;
  const wf = workflowRegistry.get(id);

  if (!wf) {
    return res.status(404).json({
      status: 'error',
      message: `Workflow "${id}" not found`,
    });
  }

  const deployResult = engine.registerWorkflow(wf);
  if (!deployResult.success) {
    return res.status(400).json({
      status: 'error',
      message: deployResult.error,
    });
  }

  res.json({
    status: 'success',
    message: `Workflow "${wf.name}" compiled and deployed into active RxJS stream pipeline`,
    workflowId: wf.workflowId,
  });
});

// GET /api/workflows - List all registered workflows
router.get('/workflows', (req: Request, res: Response) => {
  const workflows = Array.from(workflowRegistry.values()).map((w) => ({
    workflowId: w.workflowId,
    name: w.name,
    version: w.version,
    nodeCount: w.nodes.length,
    edgeCount: w.edges.length,
  }));

  res.json({
    status: 'success',
    count: workflows.length,
    data: workflows,
  });
});

// GET /api/workflows/active/pipelines - List active streaming pipelines
router.get('/workflows/active/pipelines', (_req: Request, res: Response) => {
  const active = engine.getActiveWorkflows();
  res.json({
    status: 'success',
    count: active.length,
    data: active,
  });
});

// GET /api/workflows/alerts - Get triggered alert history from reactive engine
router.get('/workflows/alerts', (_req: Request, res: Response) => {
  const alerts = engine.getAlerts();
  res.json({
    status: 'success',
    count: alerts.length,
    data: alerts,
  });
});

// POST /api/workflows/simulate-tick - Test ingestion of a telemetry frame into active pipelines
router.post('/workflows/simulate-tick', (req: Request, res: Response) => {
  const event = req.body as TelemetryStreamEvent;
  if (!event || !event.machineId || !event.metrics) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid telemetry frame. Required: { machineId, timestamp, metrics: {} }',
    });
  }

  const beforeCount = engine.getAlerts().length;
  engine.feedTelemetry(event);
  const afterAlerts = engine.getAlerts();
  const newAlerts = afterAlerts.slice(0, Math.max(0, afterAlerts.length - beforeCount));

  res.json({
    status: 'success',
    processed: true,
    alertsTriggered: newAlerts.length,
    alerts: newAlerts,
  });
});

// GET /api/workflows/:id - Retrieve single workflow JSON
router.get('/workflows/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const wf = workflowRegistry.get(id);

  if (!wf) {
    return res.status(404).json({
      status: 'error',
      message: `Workflow "${id}" not found`,
    });
  }

  res.json({
    status: 'success',
    data: wf,
  });
});

// DELETE /api/workflows/:id - Delete a workflow
router.delete('/workflows/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const existed = workflowRegistry.delete(id);
  engine.unregisterWorkflow(id);

  if (!existed) {
    return res.status(404).json({
      status: 'error',
      message: `Workflow "${id}" not found`,
    });
  }

  res.json({
    status: 'success',
    message: `Workflow "${id}" deleted successfully`,
  });
});

export default router;
