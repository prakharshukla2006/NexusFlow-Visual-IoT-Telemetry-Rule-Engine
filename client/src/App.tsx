import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DeviceFilterBar } from './components/dashboard/DeviceFilterBar';
import { SystemHealthBanner } from './components/dashboard/SystemHealthBanner';
import { TelemetryMetricCard } from './components/dashboard/TelemetryMetricCard';
import { TelemetryTrendsChart } from './components/dashboard/TelemetryTrendsChart';
import { MachineStatusGrid } from './components/dashboard/MachineStatusGrid';
import { RecentAlertsFeed } from './components/dashboard/RecentAlertsFeed';
import {
  MOCK_MACHINES,
  METRIC_DEFINITIONS,
  INITIAL_ALERTS,
  generateHistoricalTelemetry,
} from './data/mockTelemetry';
import { MetricType, TelemetryDataPoint } from './types/telemetry';

export const App: React.FC = () => {
  const [machines, setMachines] = useState(MOCK_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('T-101');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature');
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  // Store telemetry buffer per machine
  const [telemetryStore, setTelemetryStore] = useState<Record<string, TelemetryDataPoint[]>>(() => {
    const initial: Record<string, TelemetryDataPoint[]> = {};
    MOCK_MACHINES.forEach((m) => {
      initial[m.id] = generateHistoricalTelemetry(m.id, 25);
    });
    return initial;
  });

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const currentChartData = telemetryStore[selectedMachineId] || [];

  // Live telemetry stream simulator (updates every 2.5 seconds to showcase real-time reactivity)
  useEffect(() => {
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
            isAnomaly: newTemp > 85.0 || newVib > 3.5,
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
              latest.temperature > 85.0
                ? 'warning'
                : latest.vibration > 4.5
                ? 'critical'
                : 'operational',
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [telemetryStore, machines]);

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;
  const latestPoint = currentChartData[currentChartData.length - 1];

  return (
    <AppLayout activeAlertCount={activeAlertCount}>
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

      {/* Primary 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['temperature', 'vibration', 'pressure', 'rpm'] as MetricType[]).map((metricKey) => {
          const def = METRIC_DEFINITIONS[metricKey];
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
              definition={def}
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
      <TelemetryTrendsChart
        data={currentChartData}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
        machineId={selectedMachineId}
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
    </AppLayout>
  );
};

export default App;
