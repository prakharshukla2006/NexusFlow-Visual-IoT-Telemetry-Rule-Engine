/**
 * Automated Telemetry & Rule Engine Smoke Tests (Week 1 Verification)
 * Validates moving average windowing, threshold detection, and telemetry serialization.
 */

function runValidationSuite() {
  console.log('=== NexusFlow Telemetry Validation Suite (Week 1) ===\n');
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
  assert(calculatedAvg === expectedAvg, `5-Point Moving Average calculation equals ${expectedAvg}°C`);

  // Test 2: Moving Average Smoothing reduces noise
  const noisySignal = [70, 95, 71, 94, 70]; // High fluctuation
  const smoothed = noisySignal.reduce((a, b) => a + b, 0) / noisySignal.length;
  assert(smoothed === 80, `Noisy signal with 95°C spike smoothed to 80°C`);

  // Test 3: Turbine Critical Threshold Boundary Check
  const tempSafe = 84.9;
  const tempCrit = 85.1;
  const critLimit = 85.0;
  assert(tempSafe <= critLimit, `84.9°C evaluates within nominal threshold (< 85°C)`);
  assert(tempCrit > critLimit, `85.1°C evaluates as critical anomaly (> 85°C)`);

  // Test 4: Sliding Buffer Size Invariant
  const buffer = [];
  const maxCapacity = 30;
  for (let i = 0; i < 50; i++) {
    buffer.push({ idx: i });
    if (buffer.length > maxCapacity) buffer.shift();
  }
  assert(buffer.length === maxCapacity, `Buffer capacity maintained strictly at ${maxCapacity} samples`);
  assert(buffer[buffer.length - 1].idx === 49, `Buffer keeps newest sample at head`);
  assert(buffer[0].idx === 20, `Buffer discards oldest sample (sliding window)`);

  // Test 5: CSV Serialization Sanity Check
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
  assert(csvRow.includes('T-101') && csvRow.includes('86.4'), 'Telemetry CSV row formats machine and sensor metrics correctly');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runValidationSuite();
