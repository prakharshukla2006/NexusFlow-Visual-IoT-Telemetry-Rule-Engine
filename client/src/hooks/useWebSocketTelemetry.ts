import { useState, useEffect, useCallback } from 'react';
import { wsClient } from '../services/websocketClient';
import {
  TelemetryDataPoint,
  WsNetworkStats,
  TelemetryFeedMode,
  RuleAlertEvent,
} from '../types/telemetry';

interface UseWebSocketTelemetryOptions {
  machineId: string;
  initialData?: TelemetryDataPoint[];
  feedMode?: TelemetryFeedMode;
  onAlertReceived?: (alert: RuleAlertEvent) => void;
}

export function useWebSocketTelemetry({
  machineId,
  initialData = [],
  feedMode = 'live_websocket',
  onAlertReceived,
}: UseWebSocketTelemetryOptions) {
  const [networkStats, setNetworkStats] = useState<WsNetworkStats>(wsClient.getNetworkStats());
  const [liveStreamData, setLiveStreamData] = useState<TelemetryDataPoint[]>(initialData);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Initialize connection
  useEffect(() => {
    wsClient.connect();

    // Listen to network status updates
    const unsubStatus = wsClient.on('statusChange', (stats: WsNetworkStats) => {
      setNetworkStats(stats);
      setIsLiveConnected(stats.status === 'connected');
    });

    // Subscribe to selected machine
    wsClient.subscribe(machineId);

    // Listen to incoming telemetry frames
    const unsubData = wsClient.on('telemetry:data', (frame: any) => {
      if (frame.machineId === machineId) {
        setLiveStreamData((prev) => {
          const nextPoint: TelemetryDataPoint = {
            timestamp: frame.timestamp,
            timeFormatted: frame.timeFormatted,
            machineId: frame.machineId,
            temperature: frame.temperature,
            vibration: frame.vibration,
            pressure: frame.pressure,
            rpm: frame.rpm,
            power: frame.power,
            temperatureAvg: frame.temperatureAvg,
            vibrationAvg: frame.vibrationAvg,
            isAnomaly: frame.isAnomaly,
          };
          // Maintain 30-sample sliding window
          return [...prev.slice(-29), nextPoint];
        });
      }
    });

    // Listen to rule alerts
    const unsubAlert = wsClient.on('rule:alert', (alert: any) => {
      if (onAlertReceived) {
        onAlertReceived(alert);
      }
    });

    return () => {
      unsubStatus();
      unsubData();
      unsubAlert();
      wsClient.unsubscribe(machineId);
    };
  }, [machineId, onAlertReceived]);

  const reconnect = useCallback(() => {
    wsClient.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
  }, []);

  return {
    networkStats,
    liveStreamData,
    isLiveConnected,
    reconnect,
    disconnect,
  };
}
