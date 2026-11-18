import express from 'express';
import http from 'http';
import cors from 'cors';
import { NexusWebSocketServer } from './websocket/wsServer.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nexusflow-telemetry-engine',
    version: '1.0.0-w2',
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer(app);
export const wsServer = new NexusWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ NexusFlow Telemetry & WebSocket Engine Active`);
  console.log(`📡 HTTP Ingestion Gateway:  http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Stream Hub:   ws://localhost:${PORT}/ws/telemetry`);
  console.log(`=======================================================`);
});

export { app, server };
