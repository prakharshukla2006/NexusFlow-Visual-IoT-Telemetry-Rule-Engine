import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  MachineDevice,
  MetricType,
  SensorThresholds,
  TelemetryDataPoint,
} from '../../types/telemetry';
import { METRIC_DEFINITIONS } from '../../data/mockTelemetry';
import { Activity, Layers, AlertTriangle, TrendingUp, Sliders } from 'lucide-react';

interface FleetComparativeOverlayChartProps {
  telemetryStore: Record<string, TelemetryDataPoint[]>;
  machines: MachineDevice[];
  selectedMetric: MetricType;
  onSelectMetric: (metric: MetricType) => void;
  thresholds?: SensorThresholds;
}

const MACHINE_COLORS: Record<string, { stroke: string; dot: string; label: string }> = {
  'T-101': { stroke: '#06b6d4', dot: '#22d3ee', label: 'T-101 Turbine' },
  'C-204': { stroke: '#10b981', dot: '#34d399', label: 'C-204 Compressor' },
  'H-302': { stroke: '#f59e0b', dot: '#fbbf24', label: 'H-302 Hydraulic' },
  'G-501': { stroke: '#a855f7', dot: '#c084fc', label: 'G-501 Generator' },
  // Backward compatibility aliases
  'C-202': { stroke: '#10b981', dot: '#34d399', label: 'C-202 Compressor' },
  'P-303': { stroke: '#f59e0b', dot: '#fbbf24', label: 'P-303 Pump' },
  'G-404': { stroke: '#a855f7', dot: '#c084fc', label: 'G-404 Generator' },
};

export const FleetComparativeOverlayChart: React.FC<FleetComparativeOverlayChartProps> = ({
  telemetryStore,
  machines,
  selectedMetric,
  onSelectMetric,
  thresholds,
}) => {
  const metricDef = METRIC_DEFINITIONS[selectedMetric];
  const activeThresholds = thresholds || metricDef.thresholds;

  // Machine visibility toggles (defaults all fleet machines to active)
  const [visibleMachines, setVisibleMachines] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    machines.forEach((m) => {
      init[m.id] = true;
    });
    return init;
  });

  const toggleMachine = (id: string) => {
    setVisibleMachines((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  // Merge the streams across all machines by array index
  const mergedData = useMemo(() => {
    const machineIds = machines.map((m) => m.id);
    const sampleCounts = machineIds.map((id) => (telemetryStore[id] || []).length);
    const maxLen = Math.max(...sampleCounts, 0);

    const rows: Array<{
      index: number;
      timeFormatted: string;
      [machineId: string]: string | number;
    }> = [];

    for (let i = 0; i < maxLen; i++) {
      let timeFormatted = '';
      const row: { index: number; timeFormatted: string; [k: string]: string | number } = {
        index: i,
        timeFormatted: '',
      };

      let sum = 0;
      let count = 0;

      machineIds.forEach((id) => {
        const stream = telemetryStore[id] || [];
        const pt = stream[i];
        if (pt) {
          timeFormatted = pt.timeFormatted;
          const val = pt[selectedMetric] as number;
          row[id] = val;
          sum += val;
          count++;
        }
      });

      row.timeFormatted = timeFormatted || `T-${i}`;
      if (count > 0) {
        row['fleetAverage'] = Number((sum / count).toFixed(metricDef.decimals));
      }

      rows.push(row);
    }

    return rows;
  }, [telemetryStore, machines, selectedMetric, metricDef.decimals]);

  // Compute fleet summary KPIs for the latest timestamp
  const latestRow = mergedData[mergedData.length - 1] || null;
  const fleetKpis = useMemo(() => {
    if (!latestRow) return { avg: 0, maxVal: 0, maxId: 'N/A', minVal: 0, minId: 'N/A', spread: 0 };

    let sum = 0;
    let count = 0;
    let maxVal = -Infinity;
    let maxId = '';
    let minVal = Infinity;
    let minId = '';

    machines.forEach((m) => {
      const val = latestRow[m.id];
      if (typeof val === 'number') {
        sum += val;
        count++;
        if (val > maxVal) {
          maxVal = val;
          maxId = m.id;
        }
        if (val < minVal) {
          minVal = val;
          minId = m.id;
        }
      }
    });

    const avg = count > 0 ? Number((sum / count).toFixed(metricDef.decimals)) : 0;
    const spread = maxVal !== -Infinity && minVal !== Infinity ? Number((maxVal - minVal).toFixed(metricDef.decimals)) : 0;

    return { avg, maxVal, maxId, minVal, minId, spread };
  }, [latestRow, machines, metricDef.decimals]);

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl flex flex-col space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-industrial-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Fleet Comparative Influx Overlay
            </h3>
            <span className="text-[10px] bg-industrial-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800/40">
              Multi-Unit Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time cross-machine comparative telemetry overlay across all 4 monitored production units
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap gap-1 bg-industrial-950 p-1 rounded-lg border border-industrial-800">
          {(['temperature', 'vibration', 'pressure', 'rpm', 'power'] as MetricType[]).map((m) => {
            const def = METRIC_DEFINITIONS[m];
            const isSelected = selectedMetric === m;
            return (
              <button
                key={m}
                onClick={() => onSelectMetric(m)}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                  isSelected
                    ? 'bg-industrial-800 text-cyan-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {def.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fleet Telemetry Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-industrial-950/80 p-3 rounded-lg border border-industrial-800/60 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Fleet Average</span>
          <span className="text-base font-bold text-white">
            {fleetKpis.avg} <span className="text-[11px] font-normal text-slate-400">{metricDef.unit}</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Peak Unit ({fleetKpis.maxId})</span>
          <span className={`text-base font-bold ${fleetKpis.maxVal >= activeThresholds.critical ? 'text-rose-400' : 'text-amber-300'}`}>
            {fleetKpis.maxVal} <span className="text-[11px] font-normal text-slate-400">{metricDef.unit}</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Baseline Unit ({fleetKpis.minId})</span>
          <span className="text-base font-bold text-emerald-400">
            {fleetKpis.minVal} <span className="text-[11px] font-normal text-slate-400">{metricDef.unit}</span>
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Spread Delta (Δ Max-Min)</span>
          <span className="text-base font-bold text-cyan-300">
            ±{fleetKpis.spread} <span className="text-[11px] font-normal text-slate-400">{metricDef.unit}</span>
          </span>
        </div>
      </div>

      {/* Interactive Machine Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 text-[11px] uppercase mr-1">Trace Legend:</span>
        {machines.map((m) => {
          const config = MACHINE_COLORS[m.id] || { stroke: '#94a3b8', label: m.name };
          const isVisible = visibleMachines[m.id] ?? true;
          return (
            <button
              key={m.id}
              onClick={() => toggleMachine(m.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border transition-all ${
                isVisible
                  ? 'bg-industrial-950 text-white border-industrial-700 shadow-sm'
                  : 'bg-industrial-950/40 text-slate-600 border-industrial-900 opacity-60'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isVisible ? config.stroke : '#475569' }}
              />
              <span className="text-[11px] font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recharts Multi-Line Canvas */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timeFormatted"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={['auto', 'auto']}
              unit={metricDef.unit ? ` ${metricDef.unit}` : ''}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-industrial-950/95 border border-industrial-700 p-3 rounded-lg shadow-2xl font-mono text-xs text-white min-w-[210px] backdrop-blur-md">
                    <div className="text-[11px] text-slate-400 border-b border-industrial-800 pb-1 mb-2 flex justify-between">
                      <span>TIME: {label}</span>
                      <span className="text-cyan-400 font-bold uppercase">{metricDef.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      {payload.map((entry: any) => {
                        const mId = entry.dataKey;
                        if (mId === 'fleetAverage') return null;
                        const color = MACHINE_COLORS[mId]?.stroke || '#94a3b8';
                        const labelName = MACHINE_COLORS[mId]?.label || mId;
                        const val = entry.value;
                        const delta = fleetKpis.avg ? (val - fleetKpis.avg).toFixed(1) : 0;

                        return (
                          <div key={mId} className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-slate-300">{labelName}:</span>
                            </span>
                            <span className="font-bold">
                              {val} {metricDef.unit}{' '}
                              <span
                                className={`text-[10px] font-normal ${
                                  Number(delta) > 0 ? 'text-amber-400' : 'text-emerald-400'
                                }`}
                              >
                                ({Number(delta) >= 0 ? `+${delta}` : delta})
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
            />

            {/* Threshold Reference Markers */}
            <ReferenceLine
              y={activeThresholds.warning}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `WARN: ${activeThresholds.warning} ${metricDef.unit}`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'right',
                fontFamily: 'monospace',
              }}
            />
            <ReferenceLine
              y={activeThresholds.critical}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              label={{
                value: `CRIT: ${activeThresholds.critical} ${metricDef.unit}`,
                fill: '#f43f5e',
                fontSize: 10,
                position: 'right',
                fontFamily: 'monospace',
              }}
            />

            {/* Machine Line Traces */}
            {machines.map((m) => {
              if (visibleMachines[m.id] === false) return null;
              const cfg = MACHINE_COLORS[m.id] || { stroke: '#94a3b8' };
              return (
                <Line
                  key={m.id}
                  type="monotone"
                  dataKey={m.id}
                  stroke={cfg.stroke}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: cfg.stroke }}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1.5 }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
