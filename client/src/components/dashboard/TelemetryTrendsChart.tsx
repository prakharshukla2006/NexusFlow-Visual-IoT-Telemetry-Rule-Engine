import React, { useState } from 'react';
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
import {
  ChartTimeframe,
  MetricDefinition,
  MetricType,
  SensorThresholds,
  TelemetryDataPoint,
} from '../../types/telemetry';
import { METRIC_DEFINITIONS } from '../../data/mockTelemetry';
import { Download, Sliders, ShieldAlert } from 'lucide-react';

interface TelemetryTrendsChartProps {
  data: TelemetryDataPoint[];
  selectedMetric: MetricType;
  onSelectMetric: (metric: MetricType) => void;
  machineId: string;
  overrideThresholds?: SensorThresholds;
  onOpenThresholdConfig?: () => void;
  onExportCsv?: () => void;
  feedMode?: 'live_websocket' | 'static_baseline';
}

// Custom Tooltip for Industrial Telemetry
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-industrial-900/95 border border-industrial-700/80 p-3 rounded-lg shadow-2xl backdrop-blur text-xs font-mono space-y-1.5">
        <div className="text-slate-400 border-b border-industrial-800 pb-1 flex justify-between gap-4">
          <span>TIME: {label}</span>
          <span className="text-cyan-400">PTS: ACTIVE</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
            <span style={{ color: entry.color }} className="font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
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

export const TelemetryTrendsChart: React.FC<TelemetryTrendsChartProps> = ({
  data,
  selectedMetric,
  onSelectMetric,
  machineId,
  overrideThresholds,
  onOpenThresholdConfig,
  onExportCsv,
  feedMode = 'live_websocket',
}) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('5m');
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(true);
  const [showThresholds, setShowThresholds] = useState<boolean>(true);

  const activeDefinition: MetricDefinition = METRIC_DEFINITIONS[selectedMetric];

  // Thresholds for the selected metric (custom or default)
  const warningThreshold = overrideThresholds?.warning ?? activeDefinition.thresholds.warning;
  const criticalThreshold = overrideThresholds?.critical ?? activeDefinition.thresholds.critical;

  const timeframes: { id: ChartTimeframe; label: string }[] = [
    { id: '1m', label: '1 Min' },
    { id: '5m', label: '5 Min' },
    { id: '15m', label: '15 Min' },
    { id: '1h', label: '1 Hour' },
    { id: 'live', label: '● Live Stream' },
  ];

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-industrial-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-wide">
              {activeDefinition.label} Trend Analysis
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              RECHARTS SVG
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                feedMode === 'live_websocket'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {feedMode === 'live_websocket' ? '● LIVE WS FEED' : 'STATIC BASELINE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Device {machineId} • Sensor Stream & Moving Average Window
          </p>
        </div>

        {/* Controls: Timeframes & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Threshold Adjust Modal Trigger */}
          {onOpenThresholdConfig && (
            <button
              onClick={onOpenThresholdConfig}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono bg-industrial-800 hover:bg-industrial-700 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm"
              title="Adjust rule thresholds"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rule Limits</span>
            </button>
          )}

          {/* Export Telemetry CSV */}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono bg-industrial-800 hover:bg-industrial-700 text-slate-300 border border-industrial-700 transition-all"
              title="Export current telemetry samples to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Moving Average Toggle */}
          <button
            onClick={() => setShowMovingAverage(!showMovingAverage)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              showMovingAverage
                ? 'bg-industrial-800 text-cyan-300 border-cyan-500/40'
                : 'bg-industrial-900 text-slate-400 border-industrial-800 hover:text-slate-200'
            }`}
          >
            MA(5): {showMovingAverage ? 'ON' : 'OFF'}
          </button>

          {/* Threshold Lines Toggle */}
          <button
            onClick={() => setShowThresholds(!showThresholds)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              showThresholds
                ? 'bg-industrial-800 text-amber-300 border-amber-500/40'
                : 'bg-industrial-900 text-slate-400 border-industrial-800 hover:text-slate-200'
            }`}
          >
            Rules: {showThresholds ? 'ON' : 'OFF'}
          </button>

          {/* Timeframe selector */}
          <div className="flex items-center bg-industrial-950 p-1 rounded-lg border border-industrial-800 text-xs font-mono">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  timeframe === tf.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">
          Active Metric:
        </span>
        {(Object.keys(METRIC_DEFINITIONS) as MetricType[]).map((metricKey) => {
          const def = METRIC_DEFINITIONS[metricKey];
          const isCurrent = metricKey === selectedMetric;
          return (
            <button
              key={metricKey}
              onClick={() => onSelectMetric(metricKey)}
              className={`px-3 py-1 rounded-md font-mono text-xs transition-all border ${
                isCurrent
                  ? 'bg-industrial-800 text-white font-semibold border-cyan-500 shadow-sm'
                  : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:text-slate-300'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block mr-1.5"
                style={{ backgroundColor: def.color }}
              />
              {def.label} ({def.unit})
            </button>
          );
        })}
      </div>

      {/* Main Recharts Area Container */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeDefinition.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={activeDefinition.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#162238" vertical={false} />
            <XAxis
              dataKey="timeFormatted"
              stroke="#475569"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              fontFamily="monospace"
              domain={['auto', 'auto']}
              tickLine={false}
              unit={activeDefinition.unit}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Threshold Reference Lines */}
            {showThresholds && (
              <>
                <ReferenceLine
                  y={criticalThreshold}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  label={{
                    value: `CRITICAL (${criticalThreshold.toFixed(activeDefinition.decimals)} ${activeDefinition.unit})`,
                    fill: '#f43f5e',
                    fontSize: 10,
                    position: 'insideTopRight',
                    fontFamily: 'monospace',
                  }}
                />
                <ReferenceLine
                  y={warningThreshold}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: `WARN (${warningThreshold.toFixed(activeDefinition.decimals)} ${activeDefinition.unit})`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'insideBottomRight',
                    fontFamily: 'monospace',
                  }}
                />
              </>
            )}

            {/* Instantaneous Sensor Reading Stream */}
            <Area
              type="monotone"
              dataKey={selectedMetric}
              name={activeDefinition.label}
              unit={activeDefinition.unit}
              stroke={activeDefinition.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricGradient)"
              isAnimationActive={false} // Optimized for live telemetry streaming
            />

            {/* Moving Average Line for smoothing */}
            {showMovingAverage && selectedMetric === 'temperature' && (
              <Line
                type="monotone"
                dataKey="temperatureAvg"
                name="Moving Average (5-pt)"
                unit="°C"
                stroke="#38bdf8"
                strokeWidth={1.8}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showMovingAverage && selectedMetric === 'vibration' && (
              <Line
                type="monotone"
                dataKey="vibrationAvg"
                name="Moving Average (5-pt)"
                unit="mm/s"
                stroke="#38bdf8"
                strokeWidth={1.8}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-industrial-800/80">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5" style={{ backgroundColor: activeDefinition.color }} />
            <span>Instantaneous Stream</span>
          </span>
          {showMovingAverage && (
            <span className="flex items-center space-x-1.5 text-cyan-300">
              <span className="w-2.5 h-0.5 bg-cyan-400 border border-dashed" />
              <span>RxJS Moving Average Pipeline</span>
            </span>
          )}
        </div>
        <div className="text-slate-400 mt-2 sm:mt-0">
          Evaluated via Visual Rule Engine • Influx Buffer: {data.length} Samples
        </div>
      </div>
    </div>
  );
};
