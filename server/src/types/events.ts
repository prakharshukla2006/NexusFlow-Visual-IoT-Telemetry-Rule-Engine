/**
 * NexusFlow WebSocket Protocol & Telemetry Event Definitions
 * Member 4: Real-Time Dashboard & Alert Integration (Week 2 Milestone)
 */

export const WS_EVENTS = {
  // Client to Server
  CLIENT_PING: 'client:ping',
  SUBSCRIBE: 'telemetry:subscribe',
  UNSUBSCRIBE: 'telemetry:unsubscribe',
  REQUEST_HISTORY: 'telemetry:request_history',

  // Server to Client
  CONNECTION_ESTABLISHED: 'connection:established',
  SERVER_PONG: 'server:pong',
  TELEMETRY_DATA: 'telemetry:data',
  TELEMETRY_HISTORY: 'telemetry:history',
  RULE_ALERT: 'rule:alert',
  SYSTEM_STATUS: 'system:status',
} as const;

export type WsEventType = typeof WS_EVENTS[keyof typeof WS_EVENTS];

export interface WsMessage<T = any> {
  event: WsEventType | string;
  payload: T;
  timestamp: number;
}

export interface WsClientSubscribePayload {
  machineId: string;
  metrics?: string[];
}

export interface WsClientPingPayload {
  clientTime: number;
}

export interface WsServerPongPayload {
  clientTime: number;
  serverTime: number;
  latencyMs?: number;
}

export interface WsConnectionEstablishedPayload {
  clientId: string;
  serverVersion: string;
  availableMachines: string[];
  streamingRateHz: number;
  message: string;
}

export interface WsTelemetryFramePayload {
  machineId: string;
  timestamp: number;
  timeFormatted: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  power: number;
  temperatureAvg: number;
  vibrationAvg: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface WsTelemetryHistoryPayload {
  machineId: string;
  points: WsTelemetryFramePayload[];
  isStaticBaseline: boolean;
}

export interface WsRuleAlertPayload {
  id: string;
  ruleId: string;
  ruleName: string;
  machineId: string;
  machineName: string;
  metric: string;
  severity: 'info' | 'warning' | 'critical';
  threshold: number;
  actualValue: number;
  timestamp: string;
  actionStatus: 'pending' | 'dispatched' | 'webhook_delivered' | 'mock_sms_sent';
  actionDestination: string;
}
