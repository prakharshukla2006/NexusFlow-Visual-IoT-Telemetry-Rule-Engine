import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import {
  WS_EVENTS,
  WsMessage,
  WsClientSubscribePayload,
  WsClientPingPayload,
  WsServerPongPayload,
  WsConnectionEstablishedPayload,
  WsTelemetryFramePayload,
  WsRuleAlertPayload,
} from '../types/events.js';

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  clientId: string;
  subscriptions: Set<string>; // machine IDs
}

export class NexusWebSocketServer {
  private wss: WebSocketServer;
  private clientCounter = 0;

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws/telemetry' });
    this.setupListeners();
    this.startHeartbeatCheck();
  }

  private setupListeners() {
    this.wss.on('connection', (ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      this.clientCounter++;
      extWs.clientId = `client_${this.clientCounter}_${Date.now().toString(36)}`;
      extWs.isAlive = true;
      extWs.subscriptions = new Set(['*']); // Subscribe to all by default or specific

      console.log(`[WebSocket] Client connected: ${extWs.clientId}`);

      // Send welcome handshake
      const welcome: WsConnectionEstablishedPayload = {
        clientId: extWs.clientId,
        serverVersion: '1.0.0-w2',
        availableMachines: ['T-101', 'C-204', 'H-302', 'G-501'],
        streamingRateHz: 1,
        message: 'Connected to NexusFlow Industrial Telemetry WebSocket Gateway',
      };
      this.send(extWs, WS_EVENTS.CONNECTION_ESTABLISHED, welcome);

      extWs.on('pong', () => {
        extWs.isAlive = true;
      });

      extWs.on('message', (data: Buffer | string) => {
        try {
          const parsed = JSON.parse(data.toString()) as WsMessage;
          this.handleClientMessage(extWs, parsed);
        } catch (err) {
          console.error('[WebSocket] Malformed message received:', err);
        }
      });

      extWs.on('close', () => {
        console.log(`[WebSocket] Client disconnected: ${extWs.clientId}`);
      });

      extWs.on('error', (err) => {
        console.error(`[WebSocket] Error on ${extWs.clientId}:`, err.message);
      });
    });
  }

  private handleClientMessage(ws: ExtendedWebSocket, msg: WsMessage) {
    switch (msg.event) {
      case WS_EVENTS.CLIENT_PING: {
        const payload = msg.payload as WsClientPingPayload;
        const response: WsServerPongPayload = {
          clientTime: payload.clientTime,
          serverTime: Date.now(),
          latencyMs: Date.now() - payload.clientTime,
        };
        this.send(ws, WS_EVENTS.SERVER_PONG, response);
        break;
      }

      case WS_EVENTS.SUBSCRIBE: {
        const payload = msg.payload as WsClientSubscribePayload;
        if (payload?.machineId) {
          ws.subscriptions.add(payload.machineId);
          console.log(`[WebSocket] ${ws.clientId} subscribed to ${payload.machineId}`);
        }
        break;
      }

      case WS_EVENTS.UNSUBSCRIBE: {
        const payload = msg.payload as WsClientSubscribePayload;
        if (payload?.machineId) {
          ws.subscriptions.delete(payload.machineId);
          console.log(`[WebSocket] ${ws.clientId} unsubscribed from ${payload.machineId}`);
        }
        break;
      }

      default:
        console.log(`[WebSocket] Unhandled client event: ${msg.event}`);
    }
  }

  public broadcastTelemetry(frame: WsTelemetryFramePayload) {
    const payloadStr = JSON.stringify({
      event: WS_EVENTS.TELEMETRY_DATA,
      payload: frame,
      timestamp: Date.now(),
    });

    this.wss.clients.forEach((client) => {
      const extWs = client as ExtendedWebSocket;
      if (
        extWs.readyState === WebSocket.OPEN &&
        (extWs.subscriptions.has('*') || extWs.subscriptions.has(frame.machineId))
      ) {
        extWs.send(payloadStr);
      }
    });
  }

  public broadcastAlert(alert: WsRuleAlertPayload) {
    const payloadStr = JSON.stringify({
      event: WS_EVENTS.RULE_ALERT,
      payload: alert,
      timestamp: Date.now(),
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payloadStr);
      }
    });
  }

  public send(ws: WebSocket, event: string, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, payload, timestamp: Date.now() }));
    }
  }

  private startHeartbeatCheck() {
    setInterval(() => {
      this.wss.clients.forEach((client) => {
        const extWs = client as ExtendedWebSocket;
        if (!extWs.isAlive) {
          console.log(`[WebSocket] Terminating inactive client: ${extWs.clientId}`);
          return extWs.terminate();
        }
        extWs.isAlive = false;
        extWs.ping();
      });
    }, 30000);
  }

  public getConnectedClientCount(): number {
    return this.wss.clients.size;
  }
}
