import { Router, Request, Response } from 'express';
import {
  INITIAL_FLEET_MACHINES,
  machineHistoryStore,
} from '../services/telemetrySimulator.js';
import { wsServer } from '../server.js';
import { WsTelemetryFramePayload } from '../types/events.js';

const router = Router();

// GET /api/machines - List all machines
router.get('/machines', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    count: INITIAL_FLEET_MACHINES.length,
    data: INITIAL_FLEET_MACHINES.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      location: m.location,
      healthScore: m.healthScore,
      metrics: {
        temperature: m.temperature,
        vibration: m.vibration,
        pressure: m.pressure,
        rpm: m.rpm,
        power: m.power,
      },
    })),
  });
});

// GET /api/telemetry/history/:machineId - Get static baseline telemetry
router.get('/telemetry/history/:machineId', (req: Request, res: Response) => {
  const machineId = req.params.machineId.toUpperCase();
  const history = machineHistoryStore[machineId];

  if (!history || history.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: `No telemetry history found for machine ${machineId}`,
    });
  }

  res.json({
    status: 'success',
    machineId,
    sampleCount: history.length,
    isStaticBaseline: true,
    data: history,
  });
});

// POST /api/telemetry/ingest - Ingestion API (tested for sensor data submission)
router.post('/telemetry/ingest', (req: Request, res: Response) => {
  const { machineId, temperature, vibration, pressure, rpm, power } = req.body;

  if (!machineId || temperature === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required telemetry fields: machineId, temperature',
    });
  }

  const now = Date.now();
  const timeFormatted = new Date(now).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const frame: WsTelemetryFramePayload = {
    machineId,
    timestamp: now,
    timeFormatted,
    temperature: Number(temperature),
    vibration: Number(vibration ?? 1.5),
    pressure: Number(pressure ?? 120),
    rpm: Number(rpm ?? 3000),
    power: Number(power ?? 350),
    temperatureAvg: Number(temperature),
    vibrationAvg: Number(vibration ?? 1.5),
    isAnomaly: Number(temperature) > 85.0 || Number(vibration) > 3.5,
  };

  // Broadcast through WebSocket Hub
  wsServer.broadcastTelemetry(frame);

  res.status(201).json({
    status: 'accepted',
    message: 'Telemetry frame ingested and broadcasted',
    frame,
  });
});

export default router;
