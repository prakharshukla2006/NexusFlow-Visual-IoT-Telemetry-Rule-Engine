/**
 * Automated Workflow Graph Validation Test Suite (Mid-Project Review Audit)
 * Validates React Flow JSON graph parsing, node type constraints, Kahn's cycle detection,
 * and topological stream compilation ordering.
 */

import { validateWorkflowGraph } from '../dist/services/workflowValidator.js';

function runGraphValidationSuite() {
  console.log('===============================================================');
  console.log('🧪 NexusFlow Workflow Graph Validation Suite (Mid-Project Review)');
  console.log('Requirement: Demonstrate complex workflows serialize to valid JSON');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Valid Standard Linear Workflow (Turbine Overheat Protection)
  const validLinearGraph = {
    workflowId: 'wf-turb-01',
    name: 'Turbine Overheat Protection',
    nodes: [
      { id: 'n1', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' } },
      { id: 'n2', type: 'movingAverage', data: { windowSize: 5 } },
      { id: 'n3', type: 'thresholdCheck', data: { operator: '>', limit: 85.0 } },
      { id: 'n4', type: 'actionAlert', data: { severity: 'critical', actionType: 'webhook' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
    ],
  };

  const res1 = validateWorkflowGraph(validLinearGraph);
  assert(res1.valid === true && res1.errors.length === 0, 'Test 1: Standard 4-node linear workflow validates successfully');
  assert(
    JSON.stringify(res1.executionOrder) === JSON.stringify(['n1', 'n2', 'n3', 'n4']),
    'Test 2: Topological sort generates exact execution pipeline ordering [n1 -> n2 -> n3 -> n4]'
  );

  // Test 3: Multi-Branch Fork (1 Source to 2 Independent Threshold Rules)
  const multiBranchGraph = {
    workflowId: 'wf-turb-fork',
    name: 'Dual Threshold Monitor',
    nodes: [
      { id: 'src', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' } },
      { id: 'warn_thresh', type: 'thresholdCheck', data: { operator: '>=', limit: 80.0 } },
      { id: 'crit_thresh', type: 'thresholdCheck', data: { operator: '>=', limit: 85.0 } },
      { id: 'warn_act', type: 'actionAlert', data: { severity: 'warning', actionType: 'browser_push' } },
      { id: 'crit_act', type: 'actionAlert', data: { severity: 'critical', actionType: 'mock_sms' } },
    ],
    edges: [
      { id: 'e1', source: 'src', target: 'warn_thresh' },
      { id: 'e2', source: 'src', target: 'crit_thresh' },
      { id: 'e3', source: 'warn_thresh', target: 'warn_act' },
      { id: 'e4', source: 'crit_thresh', target: 'crit_act' },
    ],
  };

  const res3 = validateWorkflowGraph(multiBranchGraph);
  assert(res3.valid === true && res3.nodeCount === 5, 'Test 3: Multi-branch fork workflow correctly validated');

  // Test 4: Cycle Detection (Kahn's Algorithm flags circular dependencies)
  const cyclicGraph = {
    workflowId: 'wf-cycle-bad',
    name: 'Invalid Cyclic Workflow',
    nodes: [
      { id: 'n1', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' } },
      { id: 'n2', type: 'movingAverage', data: { windowSize: 5 } },
      { id: 'n3', type: 'thresholdCheck', data: { operator: '>', limit: 85.0 } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n2' }, // Cycle!
    ],
  };

  const res4 = validateWorkflowGraph(cyclicGraph);
  assert(res4.valid === false && res4.errors.some((e) => e.includes('Cycle detected')), 'Test 4: Circular feedback loop correctly rejected (DAG invariant)');

  // Test 5: Self-Loop Rejection
  const selfLoopGraph = {
    workflowId: 'wf-self-loop',
    name: 'Self Loop Workflow',
    nodes: [{ id: 'n1', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' } }],
    edges: [{ id: 'e1', source: 'n1', target: 'n1' }],
  };
  const res5 = validateWorkflowGraph(selfLoopGraph);
  assert(res5.valid === false && res5.errors.some((e) => e.includes('Self-loop detected')), 'Test 5: Self-referential edge correctly rejected');

  // Test 6: Rejection of Missing Required Node Parameters
  const missingParamsGraph = {
    workflowId: 'wf-missing-data',
    name: 'Missing Parameters',
    nodes: [
      { id: 'n1', type: 'dataSource', data: { machineId: 'T-101' } }, // Missing metric
      { id: 'n2', type: 'movingAverage', data: { windowSize: -4 } }, // Invalid windowSize
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  };
  const res6 = validateWorkflowGraph(missingParamsGraph);
  assert(
    res6.valid === false &&
      res6.errors.some((e) => e.includes('invalid metric')) &&
      res6.errors.some((e) => e.includes('invalid windowSize')),
    'Test 6: Node parameter constraint violations correctly caught and detailed'
  );

  // Test 7: Rejection of Invalid Operator in Threshold Check
  const invalidOpGraph = {
    workflowId: 'wf-bad-op',
    name: 'Bad Operator',
    nodes: [
      { id: 'n1', type: 'dataSource', data: { machineId: 'T-101', metric: 'vibration' } },
      { id: 'n2', type: 'thresholdCheck', data: { operator: '~=', limit: 5.0 } },
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  };
  const res7 = validateWorkflowGraph(invalidOpGraph);
  assert(res7.valid === false && res7.errors.some((e) => e.includes('invalid operator')), 'Test 7: Unsupported comparison operators rejected');

  // Test 8: Semantic Port Direction Invariant (Action cannot output)
  const badDirectionGraph = {
    workflowId: 'wf-bad-dir',
    name: 'Inverted Ports',
    nodes: [
      { id: 'act', type: 'actionAlert', data: { severity: 'warning', actionType: 'webhook' } },
      { id: 'src', type: 'dataSource', data: { machineId: 'T-101', metric: 'pressure' } },
    ],
    edges: [{ id: 'e1', source: 'act', target: 'src' }], // Action pointing into DataSource!
  };
  const res8 = validateWorkflowGraph(badDirectionGraph);
  assert(
    res8.valid === false && res8.errors.some((e) => e.includes('ActionAlert node "act" cannot have outgoing connections')),
    'Test 8: Inverted semantic port connections correctly blocked'
  );

  // Test 9: Warning on Disconnected / Floating Nodes
  const disconnectedGraph = {
    workflowId: 'wf-floating',
    name: 'Floating Node Workflow',
    nodes: [
      { id: 'n1', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' } },
      { id: 'n2', type: 'actionAlert', data: { severity: 'info', actionType: 'browser_push' } },
      { id: 'floating', type: 'movingAverage', data: { windowSize: 3 } }, // Disconnected!
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  };
  const res9 = validateWorkflowGraph(disconnectedGraph);
  assert(res9.warnings.some((w) => w.includes('is disconnected')), 'Test 9: Disconnected floating nodes produce operator warnings');

  // Test 10: High-Complexity Pipeline (6 nodes, multi-stage filter and math)
  const complexGraph = {
    workflowId: 'wf-complex-plant',
    name: 'Plant-Wide Compressor Safeguard',
    nodes: [
      { id: 'temp_src', type: 'dataSource', data: { machineId: 'C-204', metric: 'temperature' } },
      { id: 'vib_src', type: 'dataSource', data: { machineId: 'C-204', metric: 'vibration' } },
      { id: 'ma_temp', type: 'movingAverage', data: { windowSize: 5 } },
      { id: 'temp_crit', type: 'thresholdCheck', data: { operator: '>', limit: 75.0 } },
      { id: 'vib_crit', type: 'thresholdCheck', data: { operator: '>', limit: 2.2 } },
      { id: 'alert_out', type: 'actionAlert', data: { severity: 'critical', actionType: 'webhook' } },
    ],
    edges: [
      { id: 'e1', source: 'temp_src', target: 'ma_temp' },
      { id: 'e2', source: 'ma_temp', target: 'temp_crit' },
      { id: 'e3', source: 'temp_crit', target: 'alert_out' },
      { id: 'e4', source: 'vib_src', target: 'vib_crit' },
      { id: 'e5', source: 'vib_crit', target: 'alert_out' },
    ],
  };
  const res10 = validateWorkflowGraph(complexGraph);
  assert(
    res10.valid === true && res10.executionOrder.length === 6,
    'Test 10: Complex dual-stream plant-wide graph validates and compiles in DAG order'
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runGraphValidationSuite();
