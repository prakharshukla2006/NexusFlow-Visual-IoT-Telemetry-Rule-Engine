import express from 'express';
import http from 'http';
import cors from 'cors';
import { NexusWebSocketServer } from './websocket/wsServer.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import { startTelemetryBroadcaster } from './services/telemetrySimulator.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', telemetryRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nexusflow-telemetry-engine',
    version: '1.0.0-w2',
    connectedWsClients: wsServer.getConnectedClientCount(),
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer(app);
export const wsServer = new NexusWebSocketServer(server);

// Start background telemetry simulation producer
startTelemetryBroadcaster();

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ NexusFlow Telemetry & WebSocket Engine Active`);
  console.log(`📡 HTTP Ingestion Gateway:  http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Stream Hub:   ws://localhost:${PORT}/ws/telemetry`);
  console.log(`📊 Static History API:      http://localhost:${PORT}/api/telemetry/history/:machineId`);
  console.log(`=======================================================`);
});

export { app, server };
