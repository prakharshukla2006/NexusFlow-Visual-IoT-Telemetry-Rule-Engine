import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DeviceFilterBar } from './components/dashboard/DeviceFilterBar';
import { SystemHealthBanner } from './components/dashboard/SystemHealthBanner';
import { TelemetryMetricCard } from './components/dashboard/TelemetryMetricCard';
import { TelemetryTrendsChart } from './components/dashboard/TelemetryTrendsChart';
import { DualMetricsComparisonChart } from './components/dashboard/DualMetricsComparisonChart';
import { StreamPlaybackControls } from './components/dashboard/StreamPlaybackControls';
import { MachineStatusGrid } from './components/dashboard/MachineStatusGrid';
import { RecentAlertsFeed } from './components/dashboard/RecentAlertsFeed';
import { ThresholdConfigModal } from './components/dashboard/ThresholdConfigModal';
import { WsNetworkDiagnosticsModal } from './components/dashboard/WsNetworkDiagnosticsModal';
import { StaticBaselineInspector } from './components/dashboard/StaticBaselineInspector';
import { useWebSocketTelemetry } from './hooks/useWebSocketTelemetry';
import { audioAlert } from './utils/audioAlert';
import {
  MOCK_MACHINES,
  METRIC_DEFINITIONS,
  INITIAL_ALERTS,
  generateHistoricalTelemetry,
} from './data/mockTelemetry';
import {
  MetricType,
  SensorThresholds,
  TelemetryDataPoint,
  TelemetryFeedMode,
  RuleAlertEvent,
} from './types/telemetry';

export const App: React.FC = () => {
  const [machines, setMachines] = useState(MOCK_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('T-101');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature');
  const [alerts, setAlerts] = useState<RuleAlertEvent[]>(INITIAL_ALERTS);

  // Feed Mode: 'live_websocket' vs 'static_baseline' (Week 2 Milestone)
  const [feedMode, setFeedMode] = useState<TelemetryFeedMode>('live_websocket');
  const [isWsModalOpen, setIsWsModalOpen] = useState<boolean>(false);

  // Playback & View controls
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [highlightAnomalies, setHighlightAnomalies] = useState<boolean>(true);

  // Custom thresholds map (allows real-time adjustment per metric)
  const [thresholdOverrides, setThresholdOverrides] = useState<Record<string, SensorThresholds>>({});
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Static baseline dataset (Week 2 static dashboard chart reference)
  const staticBaselineStore = useMemo<Record<string, TelemetryDataPoint[]>>(() => {
    const staticMap: Record<string, TelemetryDataPoint[]> = {};
    MOCK_MACHINES.forEach((m) => {
      staticMap[m.id] = generateHistoricalTelemetry(m.id, 30);
    });
    return staticMap;
  }, []);

  // Store telemetry buffer per machine
  const [telemetryStore, setTelemetryStore] = useState<Record<string, TelemetryDataPoint[]>>(() => {
    const initial: Record<string, TelemetryDataPoint[]> = {};
    MOCK_MACHINES.forEach((m) => {
      initial[m.id] = generateHistoricalTelemetry(m.id, 25);
    });
    return initial;
  });

  const handleAlertFromWebSocket = useCallback((newAlert: RuleAlertEvent) => {
    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
    setToastMessage(`New Alert: ${newAlert.ruleName} on ${newAlert.machineName}`);
  }, []);

  // WebSocket Telemetry Hook integration (Week 2)
  const { networkStats, reconnect } = useWebSocketTelemetry({
    machineId: selectedMachineId,
    initialData: telemetryStore[selectedMachineId],
    feedMode,
    onAlertReceived: handleAlertFromWebSocket,
  });

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  // Active chart data: either static baseline reference or live stream buffer
  const currentChartData =
    feedMode === 'static_baseline'
      ? staticBaselineStore[selectedMachineId] || []
      : telemetryStore[selectedMachineId] || [];

  // Active definition merged with any runtime threshold adjustments
  const currentMetricDef = {
    ...METRIC_DEFINITIONS[selectedMetric],
    thresholds: thresholdOverrides[selectedMetric] || METRIC_DEFINITIONS[selectedMetric].thresholds,
  };

  // Toast auto-clear
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Sync audio service with state
  useEffect(() => {
    audioAlert.setEnabled(audioEnabled);
  }, [audioEnabled]);

  // Live telemetry stream simulator (updates only when in live_websocket mode and isStreaming is true)
  useEffect(() => {
    if (!isStreaming || feedMode === 'static_baseline') return;

    const tickIntervalMs = Math.round(2500 / streamSpeed);

    const interval = setInterval(() => {
      const now = Date.now();
      const timeFormatted = new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      setTelemetryStore((prevStore) => {
        const nextStore = { ...prevStore };

        machines.forEach((machine) => {
          const currentList = nextStore[machine.id] || [];
          const lastPoint = currentList[currentList.length - 1];

          // Small random walk around current readings
          const newTemp = Number(
            (lastPoint.temperature + (Math.random() * 1.6 - 0.78)).toFixed(1)
          );
          const newVib = Number(
            (Math.max(0.4, lastPoint.vibration + (Math.random() * 0.4 - 0.2))).toFixed(2)
          );
          const newPress = Number(
            (lastPoint.pressure + (Math.random() * 2 - 1)).toFixed(1)
          );
          const newRpm = Math.round(lastPoint.rpm + (Math.random() * 30 - 15));
          const newPower = Number(
            (lastPoint.power + (Math.random() * 8 - 4)).toFixed(1)
          );

          // Calculate 5-point moving average
          const recentPoints = [...currentList.slice(-4), { temperature: newTemp, vibration: newVib }];
          const tempAvg = Number(
            (recentPoints.reduce((acc, p) => acc + p.temperature, 0) / recentPoints.length).toFixed(1)
          );
          const vibAvg = Number(
            (recentPoints.reduce((acc, p) => acc + p.vibration, 0) / recentPoints.length).toFixed(2)
          );

          const tempCrit = thresholdOverrides.temperature?.critical ?? 85.0;
          const vibCrit = thresholdOverrides.vibration?.critical ?? 4.8;
          const isAnomaly = newTemp > tempCrit || newVib > vibCrit;

          if (isAnomaly && machine.id === selectedMachineId) {
            audioAlert.playCriticalAlarm();
          }

          const newPoint: TelemetryDataPoint = {
            timestamp: now,
            timeFormatted,
            machineId: machine.id,
            temperature: newTemp,
            vibration: newVib,
            pressure: newPress,
            rpm: newRpm,
            power: newPower,
            temperatureAvg: tempAvg,
            vibrationAvg: vibAvg,
            isAnomaly,
          };

          // Maintain sliding window buffer of 30 points
          nextStore[machine.id] = [...currentList.slice(-29), newPoint];
        });

        return nextStore;
      });

      // Update machine instantaneous readings
      setMachines((prevMachines) =>
        prevMachines.map((m) => {
          const stream = telemetryStore[m.id];
          if (!stream || stream.length === 0) return m;
          const latest = stream[stream.length - 1];
          const tempCrit = thresholdOverrides.temperature?.critical ?? 85.0;

          return {
            ...m,
            metrics: {
              temperature: latest.temperature,
              vibration: latest.vibration,
              pressure: latest.pressure,
              rpm: latest.rpm,
              power: latest.power,
            },
            status:
              latest.temperature > tempCrit
                ? 'critical'
                : latest.temperature > (thresholdOverrides.temperature?.warning ?? 80.0)
                ? 'warning'
                : 'operational',
          };
        })
      );
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [telemetryStore, machines, thresholdOverrides, isStreaming, streamSpeed, selectedMachineId, feedMode]);

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleSaveThresholds = (newThresholds: SensorThresholds) => {
    setThresholdOverrides((prev) => ({
      ...prev,
      [selectedMetric]: newThresholds,
    }));
    setToastMessage(`Updated ${currentMetricDef.label} limits: Warn ${newThresholds.warning}, Crit ${newThresholds.critical}`);
  };

  const handleResetDefaults = () => {
    setThresholdOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedMetric];
      return next;
    });
    setToastMessage(`Reset ${currentMetricDef.label} thresholds to system defaults`);
  };

  // Export current telemetry buffer to CSV
  const handleExportCsv = () => {
    const dataToExport = currentChartData;
    if (!dataToExport || dataToExport.length === 0) return;

    const headers = ['Timestamp', 'Time', 'MachineID', 'Temperature(C)', 'Vibration(mm/s)', 'Pressure(bar)', 'RPM', 'Power(kW)', 'TempAvg(C)', 'VibAvg(mm/s)', 'Anomaly'];
    const rows = dataToExport.map((pt) => [
      pt.timestamp,
      `"${pt.timeFormatted}"`,
      `"${pt.machineId}"`,
      pt.temperature,
      pt.vibration,
      pt.pressure,
      pt.rpm,
      pt.power,
      pt.temperatureAvg ?? '',
      pt.vibrationAvg ?? '',
      pt.isAnomaly ? 'TRUE' : 'FALSE',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexusflow-telemetry-${selectedMachineId}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Exported ${dataToExport.length} samples for ${selectedMachineId} to CSV`);
  };

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;
  const latestPoint = currentChartData[currentChartData.length - 1];

  return (
    <AppLayout
      activeAlertCount={activeAlertCount}
      onOpenWsDiagnostics={() => setIsWsModalOpen(true)}
      wsStatus={networkStats.status}
      feedMode={feedMode}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-500 text-cyan-200 px-4 py-2.5 rounded-lg shadow-2xl text-xs font-mono flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Device Filter Bar */}
      <DeviceFilterBar
        machines={machines}
        selectedMachineId={selectedMachineId}
        onSelectMachine={setSelectedMachineId}
      />

      {/* Selected Unit Health Banner */}
      <SystemHealthBanner
        selectedMachine={selectedMachine}
        totalMachines={machines.length}
        anomalyCount={selectedMachine.status !== 'operational' ? 1 : 0}
      />

      {/* Stream Playback & SCADA View Controls */}
      <StreamPlaybackControls
        isStreaming={isStreaming && feedMode === 'live_websocket'}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        streamSpeed={streamSpeed}
        onChangeSpeed={setStreamSpeed}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        highlightAnomalies={highlightAnomalies}
        onToggleHighlightAnomalies={() => setHighlightAnomalies(!highlightAnomalies)}
      />

      {/* Primary 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['temperature', 'vibration', 'pressure', 'rpm'] as MetricType[]).map((metricKey) => {
          const baseDef = METRIC_DEFINITIONS[metricKey];
          const activeDef = {
            ...baseDef,
            thresholds: thresholdOverrides[metricKey] || baseDef.thresholds,
          };
          const val = latestPoint ? (latestPoint[metricKey] as number) : selectedMachine.metrics[metricKey];
          const hist = currentChartData.map((p) => p[metricKey] as number);
          const ma =
            metricKey === 'temperature'
              ? latestPoint?.temperatureAvg
              : metricKey === 'vibration'
              ? latestPoint?.vibrationAvg
              : undefined;

          return (
            <TelemetryMetricCard
              key={metricKey}
              definition={activeDef}
              currentValue={val}
              movingAverage={ma}
              historicalPoints={hist}
              isSelected={selectedMetric === metricKey}
              onSelect={() => setSelectedMetric(metricKey)}
            />
          );
        })}
      </div>

      {/* Main Multi-Metric Time-Series Chart (Recharts) */}
      {viewMode === 'single' ? (
        <TelemetryTrendsChart
          data={currentChartData}
          selectedMetric={selectedMetric}
          onSelectMetric={setSelectedMetric}
          machineId={selectedMachineId}
          overrideThresholds={thresholdOverrides[selectedMetric]}
          onOpenThresholdConfig={() => setIsThresholdModalOpen(true)}
          onExportCsv={handleExportCsv}
          feedMode={feedMode}
        />
      ) : (
        <DualMetricsComparisonChart
          data={currentChartData}
          machineId={selectedMachineId}
          tempThresholds={thresholdOverrides.temperature}
          vibThresholds={thresholdOverrides.vibration}
        />
      )}

      {/* Static Baseline Calibration & Reference Delta Inspector (Week 2 Milestone) */}
      <StaticBaselineInspector
        currentValue={latestPoint ? (latestPoint[selectedMetric] as number) : selectedMachine.metrics[selectedMetric]}
        metric={selectedMetric}
        machineId={selectedMachineId}
        isStaticMode={feedMode === 'static_baseline'}
        onToggleStaticMode={() => setFeedMode(feedMode === 'static_baseline' ? 'live_websocket' : 'static_baseline')}
      />

      {/* Bottom Grid: Industrial Fleet Status & Real-Time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 xl:col-span-7">
          <MachineStatusGrid
            machines={machines}
            selectedMachineId={selectedMachineId}
            onSelectMachine={setSelectedMachineId}
          />
        </div>
        <div className="lg:col-span-12 xl:col-span-5">
          <RecentAlertsFeed
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        </div>
      </div>

      {/* Threshold Configuration Modal */}
      <ThresholdConfigModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        definition={currentMetricDef}
        onSaveThresholds={handleSaveThresholds}
        onResetDefaults={handleResetDefaults}
      />

      {/* WebSocket Network Diagnostics Modal (Week 2) */}
      <WsNetworkDiagnosticsModal
        isOpen={isWsModalOpen}
        onClose={() => setIsWsModalOpen(false)}
        networkStats={networkStats}
        feedMode={feedMode}
        onChangeFeedMode={setFeedMode}
        onReconnect={reconnect}
        selectedMachineId={selectedMachineId}
      />
    </AppLayout>
  );
};

export default App;
