/**
 * NexusFlow Reactive Stream Pipeline Engine Test Suite
 * 
 * Verifies Observable, Subject, pipe, bufferCount, map, filter, tap operators,
 * and graph-to-pipeline compilation from React Flow JSON workflows.
 */

import {
  Observable,
  Subject,
  map,
  filter,
  bufferCount,
  tap,
  compileGraphToPipeline,
  WorkflowExecutionRegistry,
} from '../dist/services/reactiveStreamEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('===============================================================');
console.log('🧪 NexusFlow Reactive Stream Pipeline Engine Verification Suite');
console.log('Scope: Observable, bufferCount, map, filter & JSON Graph Execution');
console.log('===============================================================');

// Test 1: Observable Emission & Subscription
{
  let received = 0;
  const obs = new Observable((observer) => {
    observer.next(42);
    observer.complete();
  });
  obs.subscribe((val) => { received = val; });
  assert(received === 42, 'Test 1: Observable executes subscribe function and emits value 42');
}

// Test 2: Subject Multicasting
{
  const subject = new Subject();
  let sub1 = 0;
  let sub2 = 0;
  subject.subscribe((v) => { sub1 += v; });
  subject.subscribe((v) => { sub2 += v * 2; });
  subject.next(10);
  assert(sub1 === 10 && sub2 === 20, 'Test 2: Subject successfully multicasts value to all active subscribers');
}

// Test 3: Map Operator Transformation
{
  const subject = new Subject();
  let result = '';
  subject.pipe(map((x) => `val_${x}`)).subscribe((v) => { result = v; });
  subject.next(99);
  assert(result === 'val_99', 'Test 3: map operator transforms emitted value correctly');
}

// Test 4: Filter Operator Predicate
{
  const subject = new Subject();
  const collected = [];
  subject.pipe(filter((x) => x > 10)).subscribe((v) => collected.push(v));
  subject.next(5);
  subject.next(15);
  subject.next(8);
  subject.next(25);
  assert(collected.length === 2 && collected[0] === 15 && collected[1] === 25, 'Test 4: filter operator allows only values satisfying condition (>10)');
}

// Test 5: BufferCount Sliding Window
{
  const subject = new Subject();
  const windows = [];
  subject.pipe(bufferCount(3, 1)).subscribe((w) => windows.push(w));
  subject.next(1);
  subject.next(2);
  subject.next(3);
  subject.next(4);
  assert(
    windows.length === 2 &&
    windows[0].join(',') === '1,2,3' &&
    windows[1].join(',') === '2,3,4',
    'Test 5: bufferCount(3, 1) maintains sliding window FIFO array'
  );
}

// Test 6: Mathematical Moving Average Pipeline
{
  const subject = new Subject();
  let lastAvg = 0;
  subject
    .pipe(
      bufferCount(5, 1),
      map((win) => Number((win.reduce((a, b) => a + b, 0) / win.length).toFixed(1)))
    )
    .subscribe((avg) => { lastAvg = avg; });

  [80, 82, 84, 86, 88].forEach((v) => subject.next(v));
  assert(lastAvg === 84.0, `Test 6: 5-point moving average pipeline computes exact mean [80..88] -> 84.0 (got ${lastAvg})`);
}

// Test 7: Compile Valid JSON Graph into Pipeline
const sampleGraph = {
  workflowId: 'wf-test-01',
  name: 'Test Turbine Overheat Protection',
  nodes: [
    { id: 'src', type: 'dataSource', data: { machineId: 'T-101', metric: 'temperature' } },
    { id: 'ma', type: 'movingAverage', data: { windowSize: 3 } },
    { id: 'thresh', type: 'thresholdCheck', data: { operator: '>', limit: 85.0 } },
    { id: 'alert', type: 'actionAlert', data: { severity: 'critical', actionType: 'webhook' } },
  ],
  edges: [
    { id: 'e1', source: 'src', target: 'ma' },
    { id: 'e2', source: 'ma', target: 'thresh' },
    { id: 'e3', source: 'thresh', target: 'alert' },
  ],
};

let alertsCaptured = [];
const compResult = compileGraphToPipeline(sampleGraph, (alert) => {
  alertsCaptured.push(alert);
});

assert(compResult.success && compResult.pipeline !== undefined, 'Test 7: Valid 4-node JSON graph compiles into active stream pipeline');

// Test 8: Pipeline Suppresses Safe Nominal Telemetry
{
  alertsCaptured = [];
  const pipeline = compResult.pipeline;
  // Feed nominal values (80, 81, 82 -> avg 81 < 85)
  pipeline.feed({ machineId: 'T-101', timestamp: Date.now(), metrics: { temperature: 80 } });
  pipeline.feed({ machineId: 'T-101', timestamp: Date.now(), metrics: { temperature: 81 } });
  pipeline.feed({ machineId: 'T-101', timestamp: Date.now(), metrics: { temperature: 82 } });
  assert(alertsCaptured.length === 0, 'Test 8: Pipeline suppresses nominal values below threshold (0 alerts generated)');
}

// Test 9: Pipeline Triggers Alert on Threshold Violation Excursion
{
  alertsCaptured = [];
  const pipeline = compResult.pipeline;
  // Feed high values (86, 88, 90 -> avg 88 > 85)
  pipeline.feed({ machineId: 'T-101', timestamp: Date.now(), metrics: { temperature: 86 } });
  pipeline.feed({ machineId: 'T-101', timestamp: Date.now(), metrics: { temperature: 88 } });
  pipeline.feed({ machineId: 'T-101', timestamp: Date.now(), metrics: { temperature: 90 } });

  assert(
    alertsCaptured.length >= 1 &&
    alertsCaptured[alertsCaptured.length - 1].triggerValue > 85.0 &&
    alertsCaptured[alertsCaptured.length - 1].severity === 'critical',
    `Test 9: Pipeline detects moving average excursion (>85.0°C) and dispatches critical alert payload`
  );
}

// Test 10: Workflow Execution Registry Lifecycle
{
  const registry = WorkflowExecutionRegistry.getInstance();
  registry.clear();
  const regResult = registry.registerWorkflow(sampleGraph);
  const activeBefore = registry.getActiveWorkflows().length;
  registry.unregisterWorkflow(sampleGraph.workflowId);
  const activeAfter = registry.getActiveWorkflows().length;

  assert(
    regResult.success && activeBefore === 1 && activeAfter === 0,
    'Test 10: WorkflowExecutionRegistry successfully registers, tracks, and unregisters active pipelines'
  );
}

console.log('===============================================================');
console.log(`Results: ${passed} passed, ${failed} failed.`);
console.log('===============================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
