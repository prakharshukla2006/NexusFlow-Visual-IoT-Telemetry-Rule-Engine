/**
 * NexusFlow Workflow Graph Validator (Week 2 Mid-Project Milestone)
 * Validates serialized React Flow JSON graphs, checks node type compatibility,
 * detects cyclic loops via Kahn's algorithm, and compiles execution ordering.
 */

export type WorkflowNodeType = 'dataSource' | 'movingAverage' | 'thresholdCheck' | 'actionAlert';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  data: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowGraph {
  workflowId: string;
  name: string;
  version?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  nodeCount: number;
  edgeCount: number;
  executionOrder?: string[];
}

const SUPPORTED_NODE_TYPES = new Set<string>([
  'dataSource',
  'movingAverage',
  'thresholdCheck',
  'actionAlert',
]);

const VALID_METRICS = new Set<string>([
  'temperature',
  'vibration',
  'pressure',
  'rpm',
  'power',
]);

const VALID_OPERATORS = new Set<string>(['>', '>=', '<', '<=', '==', '!=']);
const VALID_SEVERITIES = new Set<string>(['info', 'warning', 'critical']);
const VALID_ACTIONS = new Set<string>(['webhook', 'mock_sms', 'browser_push']);

export function validateWorkflowGraph(graph: WorkflowGraph): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!graph || typeof graph !== 'object') {
    return {
      valid: false,
      errors: ['Invalid payload: Workflow graph must be a valid JSON object.'],
      warnings: [],
      nodeCount: 0,
      edgeCount: 0,
    };
  }

  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  if (!graph.workflowId || typeof graph.workflowId !== 'string') {
    errors.push('Workflow missing required "workflowId" string identifier.');
  }

  if (!graph.name || typeof graph.name !== 'string') {
    errors.push('Workflow missing required "name" label.');
  }

  if (nodes.length === 0) {
    errors.push('Workflow canvas is empty: At least one node is required.');
    return {
      valid: false,
      errors,
      warnings,
      nodeCount: 0,
      edgeCount: edges.length,
    };
  }

  // 1. Validate Node IDs & Types
  const nodeMap = new Map<string, WorkflowNode>();
  let hasDataSource = false;
  let hasActionAlert = false;

  for (const node of nodes) {
    if (!node.id || typeof node.id !== 'string') {
      errors.push('Encountered node with missing or invalid "id" field.');
      continue;
    }

    if (nodeMap.has(node.id)) {
      errors.push(`Duplicate node id detected: "${node.id}". All node IDs must be strictly unique.`);
    }
    nodeMap.set(node.id, node);

    if (!SUPPORTED_NODE_TYPES.has(node.type)) {
      errors.push(`Unsupported node type: "${node.type}" on node id "${node.id}".`);
      continue;
    }

    const d = node.data || {};

    // Validate type-specific node parameters
    switch (node.type) {
      case 'dataSource': {
        hasDataSource = true;
        if (!d.machineId) {
          errors.push(`DataSource node "${node.id}" missing required "machineId".`);
        }
        if (!d.metric || !VALID_METRICS.has(d.metric)) {
          errors.push(
            `DataSource node "${node.id}" has invalid metric "${d.metric}". Expected one of: ${Array.from(VALID_METRICS).join(', ')}.`
          );
        }
        break;
      }

      case 'movingAverage': {
        const windowSize = Number(d.windowSize);
        if (!Number.isInteger(windowSize) || windowSize < 1 || windowSize > 100) {
          errors.push(
            `MovingAverage node "${node.id}" invalid windowSize "${d.windowSize}". Expected integer between 1 and 100.`
          );
        }
        break;
      }

      case 'thresholdCheck': {
        if (!d.operator || !VALID_OPERATORS.has(d.operator)) {
          errors.push(
            `ThresholdCheck node "${node.id}" invalid operator "${d.operator}". Expected one of: ${Array.from(VALID_OPERATORS).join(', ')}.`
          );
        }
        if (typeof d.limit !== 'number' || isNaN(d.limit)) {
          errors.push(`ThresholdCheck node "${node.id}" missing or non-numeric "limit" setpoint.`);
        }
        break;
      }

      case 'actionAlert': {
        hasActionAlert = true;
        if (!d.severity || !VALID_SEVERITIES.has(d.severity)) {
          errors.push(
            `ActionAlert node "${node.id}" invalid severity "${d.severity}". Expected one of: ${Array.from(VALID_SEVERITIES).join(', ')}.`
          );
        }
        if (!d.actionType || !VALID_ACTIONS.has(d.actionType)) {
          errors.push(
            `ActionAlert node "${node.id}" invalid actionType "${d.actionType}". Expected one of: ${Array.from(VALID_ACTIONS).join(', ')}.`
          );
        }
        break;
      }
    }
  }

  if (!hasDataSource) {
    errors.push('Workflow missing a DataSource node: Pipeline requires at least one telemetry input source.');
  }

  if (!hasActionAlert) {
    warnings.push('Workflow does not contain an ActionAlert node: Pipeline produces no outbound trigger actions.');
  }

  // 2. Validate Edges & Connectivity
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    outDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  const seenEdges = new Set<string>();

  for (const edge of edges) {
    if (!edge.id || !edge.source || !edge.target) {
      errors.push(`Edge missing required fields (id, source, target). Found: ${JSON.stringify(edge)}`);
      continue;
    }

    if (!nodeMap.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references non-existent source node "${edge.source}".`);
      continue;
    }

    if (!nodeMap.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references non-existent target node "${edge.target}".`);
      continue;
    }

    if (edge.source === edge.target) {
      errors.push(`Self-loop detected on node "${edge.source}". Self-referential edges are disallowed.`);
      continue;
    }

    const edgeKey = `${edge.source}->${edge.target}`;
    if (seenEdges.has(edgeKey)) {
      warnings.push(`Duplicate edge detected from "${edge.source}" to "${edge.target}".`);
      continue;
    }
    seenEdges.add(edgeKey);

    const sourceNode = nodeMap.get(edge.source)!;
    const targetNode = nodeMap.get(edge.target)!;

    // Semantic port validations
    if (sourceNode.type === 'actionAlert') {
      errors.push(`ActionAlert node "${sourceNode.id}" cannot have outgoing connections.`);
    }

    if (targetNode.type === 'dataSource') {
      errors.push(`DataSource node "${targetNode.id}" cannot have incoming connections.`);
    }

    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    adjacency.get(edge.source)!.push(edge.target);
  }

  // Warn on disconnected / dangling nodes
  for (const node of nodes) {
    const inDeg = inDegree.get(node.id) || 0;
    const outDeg = outDegree.get(node.id) || 0;
    if (inDeg === 0 && outDeg === 0 && nodes.length > 1) {
      warnings.push(`Node "${node.id}" (${node.type}) is disconnected from the workflow graph.`);
    }
  }

  // 3. Cycle Detection & Topological Sort (Kahn's Algorithm)
  const executionOrder: string[] = [];
  const inDegreeCopy = new Map(inDegree);
  const queue: string[] = [];

  for (const [nodeId, deg] of inDegreeCopy.entries()) {
    if (deg === 0) {
      queue.push(nodeId);
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    executionOrder.push(curr);

    const neighbors = adjacency.get(curr) || [];
    for (const neighbor of neighbors) {
      const updatedDeg = (inDegreeCopy.get(neighbor) || 1) - 1;
      inDegreeCopy.set(neighbor, updatedDeg);
      if (updatedDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (executionOrder.length !== nodes.length) {
    errors.push('Cycle detected in workflow graph: Processing pipeline must be a Directed Acyclic Graph (DAG).');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    executionOrder: errors.length === 0 ? executionOrder : undefined,
  };
}
