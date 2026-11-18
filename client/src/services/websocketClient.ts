/**
 * NexusFlow Frontend WebSocket Client Service
 * Handles connection lifecycle, subscription routing, heartbeat ping/pong, and error recovery.
 */

import { WsConnectionStatus, WsNetworkStats } from '../types/telemetry';

export type WsEventHandler<T = any> = (payload: T) => void;

export class NexusWsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private status: WsConnectionStatus = 'disconnected';
  private listeners: Map<string, Set<WsEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private lastPingSent = 0;
  private currentLatency = 0;
  private messagesCount = 0;
  private bytesCount = 0;
  private activeSubscriptions: Set<string> = new Set();
  private clientId?: string;

  constructor(url = 'ws://localhost:4000/ws/telemetry') {
    this.url = url;
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        // Resubscribe active machine subscriptions
        this.activeSubscriptions.forEach((mId) => {
          this.send('telemetry:subscribe', { machineId: mId });
        });
      };

      this.ws.onmessage = (event) => {
        this.messagesCount++;
        this.bytesCount += typeof event.data === 'string' ? event.data.length : 0;

        try {
          const parsed = JSON.parse(event.data);
          const { event: eventName, payload } = parsed;

          if (eventName === 'server:pong') {
            if (this.lastPingSent > 0) {
              this.currentLatency = Date.now() - this.lastPingSent;
            }
          } else if (eventName === 'connection:established') {
            this.clientId = payload.clientId;
          }

          // Trigger registered callbacks
          const handlers = this.listeners.get(eventName);
          if (handlers) {
            handlers.forEach((h) => h(payload));
          }
        } catch (e) {
          console.error('[NexusWsClient] Error parsing message:', e);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[NexusWsClient] Socket error occurred (backend may be offline, using static baseline)');
        if (this.ws) this.ws.close();
      };
    } catch (e) {
      console.warn('[NexusWsClient] Connection attempt failed:', e);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  public subscribe(machineId: string) {
    this.activeSubscriptions.add(machineId);
    if (this.status === 'connected') {
      this.send('telemetry:subscribe', { machineId });
    }
  }

  public unsubscribe(machineId: string) {
    this.activeSubscriptions.delete(machineId);
    if (this.status === 'connected') {
      this.send('telemetry:unsubscribe', { machineId });
    }
  }

  public on<T = any>(event: string, handler: WsEventHandler<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  public send(event: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload, timestamp: Date.now() }));
    }
  }

  private setStatus(status: WsConnectionStatus) {
    this.status = status;
    const handlers = this.listeners.get('statusChange');
    if (handlers) {
      handlers.forEach((h) => h(this.getNetworkStats()));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.status === 'connected') {
        this.lastPingSent = Date.now();
        this.send('client:ping', { clientTime: this.lastPingSent });
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[NexusWsClient] Max reconnect attempts reached. Remaining in static baseline mode.');
      return;
    }

    this.setStatus('reconnecting');
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public getNetworkStats(): WsNetworkStats {
    return {
      status: this.status,
      latencyMs: this.currentLatency,
      messagesReceived: this.messagesCount,
      bytesReceived: this.bytesCount,
      reconnectCount: this.reconnectAttempts,
      serverUrl: this.url,
      clientId: this.clientId,
      lastHeartbeat: new Date().toLocaleTimeString(),
    };
  }
}

// Global Singleton Client
export const wsClient = new NexusWsClient();
