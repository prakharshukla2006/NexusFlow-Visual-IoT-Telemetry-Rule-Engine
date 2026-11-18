import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TelemetryDataPoint, SensorThresholds } from '../../types/telemetry';
import { METRIC_DEFINITIONS } from '../../data/mockTelemetry';
import { Columns, SplitSquareVertical } from 'lucide-react';

interface DualMetricsComparisonChartProps {
  data: TelemetryDataPoint[];
  machineId: string;
  tempThresholds?: SensorThresholds;
  vibThresholds?: SensorThresholds;
}

const CustomSyncTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-industrial-900/95 border border-industrial-700/80 p-2.5 rounded-lg shadow-2xl backdrop-blur text-xs font-mono space-y-1">
        <div className="text-slate-400 border-b border-industrial-800 pb-0.5 flex justify-between gap-3 text-[10px]">
          <span>{label}</span>
          <span className="text-cyan-400">SYNCED</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-3 text-[11px]">
            <span style={{ color: entry.color }} className="font-semibold">
              {entry.name}:
            </span>
            <span className="text-white font-bold">
              {entry.value} {entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DualMetricsComparisonChart: React.FC<DualMetricsComparisonChartProps> = ({
  data,
  machineId,
  tempThresholds,
  vibThresholds,
}) => {
  const tempDef = METRIC_DEFINITIONS.temperature;
  const vibDef = METRIC_DEFINITIONS.vibration;

  const tempCrit = tempThresholds?.critical ?? tempDef.thresholds.critical;
  const vibCrit = vibThresholds?.critical ?? vibDef.thresholds.critical;

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-industrial-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Columns className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Thermal-Mechanical Dual Synchronized View
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Recharts syncId
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          Scrub either chart to compare Temperature vs Vibration in real time
        </span>
      </div>

      {/* Grid of 2 Synchronized Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Temperature */}
        <div className="bg-industrial-950/70 p-3 rounded-lg border border-industrial-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-rose-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {tempDef.label} ({tempDef.unit})
            </span>
            <span className="text-slate-400 text-[10px]">
              Critical: {tempCrit}°C
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                syncId="nexus-telemetry-sync"
                data={data}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="syncTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tempDef.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={tempDef.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162238" vertical={false} />
                <XAxis dataKey="timeFormatted" stroke="#475569" fontSize={10} fontFamily="monospace" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" domain={['auto', 'auto']} tickLine={false} unit="°C" />
                <Tooltip content={<CustomSyncTooltip />} />
                <ReferenceLine y={tempCrit} stroke="#f43f5e" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  unit="°C"
                  stroke={tempDef.color}
                  strokeWidth={2}
                  fill="url(#syncTempGrad)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="temperatureAvg"
                  name="Temp MA(5)"
                  unit="°C"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vibration */}
        <div className="bg-industrial-950/70 p-3 rounded-lg border border-industrial-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {vibDef.label} ({vibDef.unit})
            </span>
            <span className="text-slate-400 text-[10px]">
              Critical: {vibCrit} mm/s
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                syncId="nexus-telemetry-sync"
                data={data}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="syncVibGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={vibDef.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={vibDef.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162238" vertical={false} />
                <XAxis dataKey="timeFormatted" stroke="#475569" fontSize={10} fontFamily="monospace" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" domain={['auto', 'auto']} tickLine={false} unit="mm/s" />
                <Tooltip content={<CustomSyncTooltip />} />
                <ReferenceLine y={vibCrit} stroke="#f43f5e" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration"
                  unit="mm/s"
                  stroke={vibDef.color}
                  strokeWidth={2}
                  fill="url(#syncVibGrad)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="vibrationAvg"
                  name="Vib MA(5)"
                  unit="mm/s"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
