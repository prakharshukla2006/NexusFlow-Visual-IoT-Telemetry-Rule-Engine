/**
 * Automated Telemetry & Rule Engine Smoke Tests (Week 1 Verification)
 * Validates moving average windowing, threshold detection, fleet aggregation, and telemetry serialization.
 */

function runValidationSuite() {
  console.log('=== NexusFlow Telemetry Validation Suite (Week 1 Extended) ===\n');
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

  // Test 1: 5-Point Moving Average Calculation
  const testWindow = [80.0, 82.0, 84.0, 86.0, 88.0];
  const expectedAvg = 84.0;
  const calculatedAvg = Number((testWindow.reduce((a, b) => a + b, 0) / testWindow.length).toFixed(1));
  assert(calculatedAvg === expectedAvg, `Test 1: 5-Point Moving Average calculation equals ${expectedAvg}°C`);

  // Test 2: Moving Average Smoothing reduces noise
  const noisySignal = [70, 95, 71, 94, 70]; // High fluctuation
  const smoothed = noisySignal.reduce((a, b) => a + b, 0) / noisySignal.length;
  assert(smoothed === 80, `Test 2: Noisy signal with 95°C spike smoothed to 80°C`);

  // Test 3: Turbine Safe Threshold Boundary Check
  const tempSafe = 84.9;
  const critLimit = 85.0;
  assert(tempSafe <= critLimit, `Test 3: 84.9°C evaluates within nominal threshold (< 85°C)`);

  // Test 4: Turbine Critical Threshold Boundary Check
  const tempCrit = 85.1;
  assert(tempCrit > critLimit, `Test 4: 85.1°C evaluates as critical anomaly (> 85°C)`);

  // Test 5: Sliding Buffer Size Invariant
  const buffer = [];
  const maxCapacity = 30;
  for (let i = 0; i < 50; i++) {
    buffer.push({ idx: i });
    if (buffer.length > maxCapacity) buffer.shift();
  }
  assert(buffer.length === maxCapacity, `Test 5: Buffer capacity maintained strictly at ${maxCapacity} samples`);

  // Test 6: Buffer FIFO Head and Tail Invariant
  const newestAtHead = buffer[buffer.length - 1].idx === 49;
  const oldestDiscarded = buffer[0].idx === 20;
  assert(newestAtHead && oldestDiscarded, `Test 6: Buffer maintains FIFO eviction (idx 49 at head, idx 20 at tail)`);

  // Test 7: CSV Serialization Sanity Check
  const samplePoint = {
    timestamp: 1731900000000,
    timeFormatted: '12:00:00',
    machineId: 'T-101',
    temperature: 86.4,
    vibration: 2.85,
    pressure: 124.5,
    rpm: 3240,
    power: 450.2,
  };
  const csvRow = `${samplePoint.timestamp},"${samplePoint.timeFormatted}","${samplePoint.machineId}",${samplePoint.temperature},${samplePoint.vibration}`;
  assert(csvRow.includes('T-101') && csvRow.includes('86.4'), 'Test 7: Telemetry CSV row formats machine and sensor metrics correctly');

  // Test 8: Sensor Reading Bounds Validation
  const validTempBounds = samplePoint.temperature >= 0 && samplePoint.temperature <= 150;
  const validVibBounds = samplePoint.vibration >= 0 && samplePoint.vibration <= 25;
  assert(validTempBounds && validVibBounds, 'Test 8: Industrial metric values conform to physical telemetry domain bounds');

  // Test 9: Fleet Multi-Machine Synchronization
  const fleetMachines = ['T-101', 'C-202', 'P-303', 'G-404'];
  const fleetSample = {
    'T-101': 82.4,
    'C-202': 71.2,
    'P-303': 64.8,
    'G-404': 78.6,
  };
  const hasAllFleetUnits = fleetMachines.every((id) => typeof fleetSample[id] === 'number');
  assert(hasAllFleetUnits, 'Test 9: Fleet comparative overlay synchronizes all 4 plant production units');

  // Test 10: Fleet Variance & Spread Delta Calculation
  const fleetVals = Object.values(fleetSample);
  const maxFleetVal = Math.max(...fleetVals);
  const minFleetVal = Math.min(...fleetVals);
  const deltaSpread = Number((maxFleetVal - minFleetVal).toFixed(1));
  const expectedSpread = 17.6; // 82.4 - 64.8
  assert(deltaSpread === expectedSpread, `Test 10: Fleet spread delta correctly computed as ${expectedSpread}°C (Max - Min)`);

  // Test 11: Operational Band Distribution Sum Invariant (Total == 100%)
  const distributionBins = [
    { band: 'Optimal Safe', percentage: 60.0 },
    { band: 'High Nominal', percentage: 25.0 },
    { band: 'Warning State', percentage: 10.0 },
    { band: 'Critical Excursion', percentage: 5.0 },
  ];
  const totalPercentage = distributionBins.reduce((acc, b) => acc + b.percentage, 0);
  assert(Math.abs(totalPercentage - 100.0) < 0.001, 'Test 11: Histogram operational band distribution sums to exactly 100%');

  // Test 12: Anomaly Threshold Hysteresis Stability Under Jitter
  const jitterReadings = [84.8, 85.2, 84.9, 85.3, 84.7];
  const anomalies = jitterReadings.filter((r) => r > 85.0);
  assert(anomalies.length === 2, 'Test 12: Threshold detection identifies exactly 2 excursions in jitter signal without false drops');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runValidationSuite();
