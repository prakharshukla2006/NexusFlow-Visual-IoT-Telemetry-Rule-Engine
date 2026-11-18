import { WsTelemetryFramePayload, WsRuleAlertPayload } from '../types/events.js';
import { wsServer } from '../server.js';

interface MachineState {
  id: string;
  name: string;
  category: string;
  location: string;
  healthScore: number;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  power: number;
  tempWindow: number[];
  vibWindow: number[];
}

export const INITIAL_FLEET_MACHINES: MachineState[] = [
  {
    id: 'T-101',
    name: 'Industrial Gas Turbine 01',
    category: 'Turbine',
    location: 'Bay 1 - Power Hall A',
    healthScore: 84,
    temperature: 86.4,
    vibration: 2.85,
    pressure: 124.5,
    rpm: 3240,
    power: 450.2,
    tempWindow: [82.1, 83.4, 84.8, 85.5, 86.4],
    vibWindow: [2.5, 2.6, 2.7, 2.8, 2.85],
  },
  {
    id: 'C-204',
    name: 'Centrifugal Gas Compressor',
    category: 'Compressor',
    location: 'Bay 3 - Compression Unit',
    healthScore: 97,
    temperature: 68.2,
    vibration: 1.42,
    pressure: 152.0,
    rpm: 2980,
    power: 310.8,
    tempWindow: [67.0, 67.5, 67.9, 68.1, 68.2],
    vibWindow: [1.38, 1.40, 1.41, 1.41, 1.42],
  },
  {
    id: 'H-302',
    name: 'Heavy Hydraulic Pump Unit',
    category: 'Hydraulic Pump',
    location: 'Sub-Level B - Fluid Depot',
    healthScore: 93,
    temperature: 71.5,
    vibration: 2.10,
    pressure: 138.2,
    rpm: 1450,
    power: 185.0,
    tempWindow: [70.5, 70.8, 71.0, 71.2, 71.5],
    vibWindow: [2.05, 2.08, 2.09, 2.10, 2.10],
  },
  {
    id: 'G-501',
    name: 'Auxiliary Turbogenerator',
    category: 'Power Generator',
    location: 'Bay 4 - Grid Inverter',
    healthScore: 99,
    temperature: 62.0,
    vibration: 0.95,
    pressure: 98.4,
    rpm: 3000,
    power: 620.0,
    tempWindow: [61.5, 61.8, 61.9, 62.0, 62.0],
    vibWindow: [0.92, 0.93, 0.94, 0.95, 0.95],
  },
];

// In-memory static baseline history store (30 samples per machine)
export const machineHistoryStore: Record<string, WsTelemetryFramePayload[]> = {};

// Initialize static baseline historical data
export function initializeStaticTelemetryHistory() {
  const now = Date.now();
  INITIAL_FLEET_MACHINES.forEach((machine) => {
    const list: WsTelemetryFramePayload[] = [];
    const count = 30;
    const interval = 2000;

    for (let i = count - 1; i >= 0; i--) {
      const ts = now - i * interval;
      const timeFormatted = new Date(ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const temp = Number((machine.temperature - (i * 0.1) + (Math.random() * 1 - 0.5)).toFixed(1));
      const vib = Number((machine.vibration + (Math.random() * 0.2 - 0.1)).toFixed(2));
      const press = Number((machine.pressure + (Math.random() * 2 - 1)).toFixed(1));
      const rpm = Math.round(machine.rpm + (Math.random() * 20 - 10));
      const power = Number((machine.power + (Math.random() * 4 - 2)).toFixed(1));

      list.push({
        machineId: machine.id,
        timestamp: ts,
        timeFormatted,
        temperature: temp,
        vibration: vib,
        pressure: press,
        rpm,
        power,
        temperatureAvg: temp,
        vibrationAvg: vib,
        isAnomaly: temp > 85.0 || vib > 3.5,
      });
    }
    machineHistoryStore[machine.id] = list;
  });
}

// Background simulator loop
export function startTelemetryBroadcaster() {
  initializeStaticTelemetryHistory();

  let tickCount = 0;

  setInterval(() => {
    tickCount++;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    INITIAL_FLEET_MACHINES.forEach((machine) => {
      // Natural sensor fluctuation
      const drift = Math.random() * 1.2 - 0.58;
      const newTemp = Number((machine.temperature + drift).toFixed(1));
      const newVib = Number((Math.max(0.4, machine.vibration + (Math.random() * 0.3 - 0.15))).toFixed(2));
      const newPress = Number((machine.pressure + (Math.random() * 1.5 - 0.75)).toFixed(1));
      const newRpm = Math.round(machine.rpm + (Math.random() * 24 - 12));
      const newPower = Number((machine.power + (Math.random() * 6 - 3)).toFixed(1));

      machine.temperature = newTemp;
      machine.vibration = newVib;
      machine.pressure = newPress;
      machine.rpm = newRpm;
      machine.power = newPower;

      // 5-point moving average
      machine.tempWindow.push(newTemp);
      if (machine.tempWindow.length > 5) machine.tempWindow.shift();
      const tempAvg = Number((machine.tempWindow.reduce((a, b) => a + b, 0) / machine.tempWindow.length).toFixed(1));

      machine.vibWindow.push(newVib);
      if (machine.vibWindow.length > 5) machine.vibWindow.shift();
      const vibAvg = Number((machine.vibWindow.reduce((a, b) => a + b, 0) / machine.vibWindow.length).toFixed(2));

      const isAnomaly = newTemp > 85.0 || newVib > 3.5;

      const frame: WsTelemetryFramePayload = {
        machineId: machine.id,
        timestamp: now,
        timeFormatted,
        temperature: newTemp,
        vibration: newVib,
        pressure: newPress,
        rpm: newRpm,
        power: newPower,
        temperatureAvg: tempAvg,
        vibrationAvg: vibAvg,
        isAnomaly,
        anomalyReason: isAnomaly
          ? newTemp > 85.0
            ? 'Temperature threshold exceeded (>85.0°C)'
            : 'Vibration threshold exceeded (>3.5 mm/s)'
          : undefined,
      };

      // Append to rolling history
      if (!machineHistoryStore[machine.id]) machineHistoryStore[machine.id] = [];
      machineHistoryStore[machine.id].push(frame);
      if (machineHistoryStore[machine.id].length > 50) {
        machineHistoryStore[machine.id].shift();
      }

      // Broadcast frame via WebSocket Server
      wsServer.broadcastTelemetry(frame);

      // Periodically trigger a rule alert if anomaly sustained
      if (isAnomaly && tickCount % 5 === 0) {
        const alertPayload: WsRuleAlertPayload = {
          id: `ALT-${Date.now().toString().slice(-4)}`,
          ruleId: newTemp > 85.0 ? 'RULE-HIGH-TEMP' : 'RULE-VIB-SPIKE',
          ruleName: newTemp > 85.0 ? 'Turbine Bearing High Temp Alert' : 'Vibration Exceeded Safe Boundary',
          machineId: machine.id,
          machineName: machine.name,
          metric: newTemp > 85.0 ? 'temperature' : 'vibration',
          severity: newTemp > 88.0 ? 'critical' : 'warning',
          threshold: newTemp > 85.0 ? 85.0 : 3.5,
          actualValue: newTemp > 85.0 ? newTemp : newVib,
          timestamp: 'Just now',
          actionStatus: 'pending',
          actionDestination: 'Webhook Queue / Mock SMS',
        };
        wsServer.broadcastAlert(alertPayload);
      }
    });
  }, 2000);
}
