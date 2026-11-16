import { MachineDevice, MetricDefinition, RuleAlertEvent, TelemetryDataPoint } from '../types/telemetry';

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  temperature: {
    key: 'temperature',
    label: 'Bearing Temperature',
    unit: '°C',
    decimals: 1,
    color: '#f43f5e',
    thresholds: {
      warning: 80.0,
      critical: 85.0,
      minNormal: 50.0,
    },
    iconName: 'Thermometer',
  },
  vibration: {
    key: 'vibration',
    label: 'Shaft Vibration (RMS)',
    unit: 'mm/s',
    decimals: 2,
    color: '#f59e0b',
    thresholds: {
      warning: 3.5,
      critical: 4.8,
      minNormal: 0.5,
    },
    iconName: 'Activity',
  },
  pressure: {
    key: 'pressure',
    label: 'Hydraulic Pressure',
    unit: 'bar',
    decimals: 1,
    color: '#00f0ff',
    thresholds: {
      warning: 140.0,
      critical: 165.0,
      minNormal: 90.0,
    },
    iconName: 'Gauge',
  },
  rpm: {
    key: 'rpm',
    label: 'Rotor Velocity',
    unit: 'RPM',
    decimals: 0,
    color: '#10b981',
    thresholds: {
      warning: 3400,
      critical: 3650,
      minNormal: 2800,
    },
    iconName: 'Zap',
  },
};

export const MOCK_MACHINES: MachineDevice[] = [
  {
    id: 'T-101',
    name: 'Industrial Gas Turbine 01',
    model: 'Apex Turbodyne 7000',
    category: 'Turbine',
    location: 'Bay 1 - Power Hall A',
    status: 'warning',
    healthScore: 84,
    lastHeartbeat: '2s ago',
    metrics: {
      temperature: 86.4, // Over the 85C threshold! Matches the brief example
      vibration: 2.85,
      pressure: 124.5,
      rpm: 3240,
      power: 450.2,
    },
  },
  {
    id: 'C-204',
    name: 'Centrifugal Gas Compressor',
    model: 'AeroPress CP-400',
    category: 'Compressor',
    location: 'Bay 3 - Compression Unit',
    status: 'operational',
    healthScore: 97,
    lastHeartbeat: '1s ago',
    metrics: {
      temperature: 68.2,
      vibration: 1.42,
      pressure: 152.0,
      rpm: 2980,
      power: 310.8,
    },
  },
  {
    id: 'H-302',
    name: 'Heavy Hydraulic Pump Unit',
    model: 'HydroMax 950-X',
    category: 'Hydraulic Pump',
    location: 'Sub-Level B - Fluid Depot',
    status: 'operational',
    healthScore: 93,
    lastHeartbeat: '3s ago',
    metrics: {
      temperature: 71.5,
      vibration: 2.10,
      pressure: 138.2,
      rpm: 1450,
      power: 185.0,
    },
  },
  {
    id: 'G-501',
    name: 'Auxiliary Turbogenerator',
    model: 'VoltCore Ultra-G5',
    category: 'Power Generator',
    location: 'Bay 4 - Grid Inverter',
    status: 'operational',
    healthScore: 99,
    lastHeartbeat: '1s ago',
    metrics: {
      temperature: 62.0,
      vibration: 0.95,
      pressure: 98.4,
      rpm: 3000,
      power: 620.0,
    },
  },
];

export function generateHistoricalTelemetry(machineId: string, pointCount = 30): TelemetryDataPoint[] {
  const machine = MOCK_MACHINES.find(m => m.id === machineId) || MOCK_MACHINES[0];
  const points: TelemetryDataPoint[] = [];
  const now = Date.now();
  const intervalMs = 2000; // 2 seconds between points

  let temp = machine.metrics.temperature - 5;
  let vib = machine.metrics.vibration - 0.5;
  let press = machine.metrics.pressure - 6;
  let rpm = machine.metrics.rpm - 80;
  let power = machine.metrics.power - 20;

  const windowSize = 5;
  const tempWindow: number[] = [];
  const vibWindow: number[] = [];

  for (let i = pointCount - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const timeFormatted = new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Realistic small fluctuation with slight drift upwards towards recent points
    const drift = ((pointCount - i) / pointCount) * 4;
    temp = Number((machine.metrics.temperature - 3 + drift + (Math.random() * 2 - 1)).toFixed(1));
    vib = Number((machine.metrics.vibration - 0.4 + (Math.random() * 0.8 - 0.4)).toFixed(2));
    press = Number((machine.metrics.pressure + (Math.random() * 4 - 2)).toFixed(1));
    rpm = Math.round(machine.metrics.rpm + (Math.random() * 60 - 30));
    power = Number((machine.metrics.power + (Math.random() * 15 - 7.5)).toFixed(1));

    tempWindow.push(temp);
    if (tempWindow.length > windowSize) tempWindow.shift();
    const tempAvg = Number((tempWindow.reduce((a, b) => a + b, 0) / tempWindow.length).toFixed(1));

    vibWindow.push(vib);
    if (vibWindow.length > windowSize) vibWindow.shift();
    const vibAvg = Number((vibWindow.reduce((a, b) => a + b, 0) / vibWindow.length).toFixed(2));

    const isAnomaly = temp > 85.0 || vib > 3.5;

    points.push({
      timestamp,
      timeFormatted,
      machineId,
      temperature: temp,
      vibration: vib,
      pressure: press,
      rpm,
      power,
      temperatureAvg: tempAvg,
      vibrationAvg: vibAvg,
      isAnomaly,
    });
  }

  return points;
}

export const INITIAL_ALERTS: RuleAlertEvent[] = [
  {
    id: 'ALT-1092',
    ruleId: 'RULE-HIGH-TEMP',
    ruleName: 'Turbine Bearing High Temp Alert',
    machineId: 'T-101',
    machineName: 'Industrial Gas Turbine 01',
    metric: 'temperature',
    severity: 'critical',
    threshold: 85.0,
    actualValue: 86.4,
    timestamp: '2 mins ago',
    acknowledged: false,
    actionType: 'mock_sms',
    actionStatus: 'mock_sms_sent',
    actionDestination: '+1 (555) 019-8422 (Factory Mgr)',
  },
  {
    id: 'ALT-1088',
    ruleId: 'RULE-VIB-SPIKE',
    ruleName: 'Shaft Vibration Warning Threshold',
    machineId: 'H-302',
    machineName: 'Heavy Hydraulic Pump Unit',
    metric: 'vibration',
    severity: 'warning',
    threshold: 3.5,
    actualValue: 3.65,
    timestamp: '14 mins ago',
    acknowledged: true,
    actionType: 'webhook',
    actionStatus: 'webhook_delivered',
    actionDestination: 'https://ops.nexusflow.internal/alerts/scada',
  },
  {
    id: 'ALT-1075',
    ruleId: 'RULE-AVG-DRIFT',
    ruleName: 'Compressor Moving Average Temperature Trend',
    machineId: 'C-204',
    machineName: 'Centrifugal Gas Compressor',
    metric: 'temperature',
    severity: 'info',
    threshold: 75.0,
    actualValue: 72.8,
    timestamp: '42 mins ago',
    acknowledged: true,
    actionType: 'browser_push',
    actionStatus: 'dispatched',
    actionDestination: 'Dashboard Toast / Push',
  },
];
