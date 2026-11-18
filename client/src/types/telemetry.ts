/**
 * NexusFlow Industrial IoT Telemetry Type Definitions
 * Member 4: Real-Time Dashboard & Alert Integration
 */

export type MachineStatus = 'operational' | 'warning' | 'critical' | 'offline';

export type MetricType = 'temperature' | 'vibration' | 'pressure' | 'rpm' | 'power';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertActionStatus = 'pending' | 'dispatched' | 'webhook_delivered' | 'mock_sms_sent' | 'suppressed';

export type ChartTimeframe = '1m' | '5m' | '15m' | '1h' | 'live';

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type TelemetryFeedMode = 'live_websocket' | 'static_baseline';

export interface WsNetworkStats {
  status: WsConnectionStatus;
  latencyMs: number;
  messagesReceived: number;
  bytesReceived: number;
  reconnectCount: number;
  serverUrl: string;
  clientId?: string;
  lastHeartbeat?: string;
}

export interface SensorThresholds {
  warning: number;
  critical: number;
  minNormal?: number;
}

export interface MetricDefinition {
  key: MetricType;
  label: string;
  unit: string;
  decimals: number;
  color: string;
  thresholds: SensorThresholds;
  iconName: string;
}

export interface MachineDevice {
  id: string;
  name: string;
  model: string;
  category: 'Turbine' | 'Compressor' | 'Hydraulic Pump' | 'Power Generator';
  location: string;
  status: MachineStatus;
  healthScore: number; // 0 - 100%
  lastHeartbeat: string;
  metrics: {
    temperature: number; // °C
    vibration: number;   // mm/s
    pressure: number;    // bar
    rpm: number;         // rev/min
    power: number;       // kW
  };
}

export interface TelemetryDataPoint {
  timestamp: number;
  timeFormatted: string; // "14:23:05"
  machineId: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  power: number;
  // Moving averages (evaluated by rule engine or smoothed for live display)
  temperatureAvg?: number;
  vibrationAvg?: number;
  isAnomaly?: boolean;
}

export interface RuleAlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  machineId: string;
  machineName: string;
  metric: MetricType;
  severity: AlertSeverity;
  threshold: number;
  actualValue: number;
  timestamp: string;
  acknowledged: boolean;
  actionType: 'webhook' | 'mock_sms' | 'browser_push';
  actionStatus: AlertActionStatus;
  actionDestination: string; // e.g. "https://api.factory.internal/webhook" or "+1-555-0199"
}

export interface DashboardFleetSummary {
  totalMachines: number;
  operationalMachines: number;
  warningMachines: number;
  criticalMachines: number;
  fleetHealthPercentage: number;
  activeAlertCount: number;
  totalIngestedPointsPerSec: number;
  lastUpdated: string;
}
