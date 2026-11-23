import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { MetricType, SensorThresholds, TelemetryDataPoint } from '../../types/telemetry';
import { METRIC_DEFINITIONS } from '../../data/mockTelemetry';
import { BarChart3, Info } from 'lucide-react';

interface MetricDistributionHistogramProps {
  data: TelemetryDataPoint[];
  selectedMetric: MetricType;
  thresholds?: SensorThresholds;
  machineId: string;
}

export const MetricDistributionHistogram: React.FC<MetricDistributionHistogramProps> = ({
  data,
  selectedMetric,
  thresholds,
  machineId,
}) => {
  const metricDef = METRIC_DEFINITIONS[selectedMetric];
  const activeThresholds = thresholds || metricDef.thresholds;

  const distribution = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        bins: [
          { band: 'Optimal Safe', range: 'N/A', count: 0, percentage: 0, color: '#10b981' },
          { band: 'High Nominal', range: 'N/A', count: 0, percentage: 0, color: '#06b6d4' },
          { band: 'Warning State', range: 'N/A', count: 0, percentage: 0, color: '#f59e0b' },
          { band: 'Critical Excursion', range: 'N/A', count: 0, percentage: 0, color: '#f43f5e' },
        ],
        mean: 0,
        stdDev: 0,
        count: 0,
      };
    }

    const values = data.map((d) => d[selectedMetric] as number);
    const count = values.length;
    const mean = Number((values.reduce((a, b) => a + b, 0) / count).toFixed(metricDef.decimals));
    const variance =
      values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Number(Math.sqrt(variance).toFixed(metricDef.decimals));

    const warnLimit = activeThresholds.warning;
    const critLimit = activeThresholds.critical;
    const nominalCeiling = warnLimit * 0.85;

    let optimal = 0;
    let elevated = 0;
    let warning = 0;
    let critical = 0;

    values.forEach((v) => {
      if (v >= critLimit) critical++;
      else if (v >= warnLimit) warning++;
      else if (v >= nominalCeiling) elevated++;
      else optimal++;
    });

    const bins = [
      {
        band: 'Optimal Safe',
        range: `< ${nominalCeiling.toFixed(1)}${metricDef.unit}`,
        count: optimal,
        percentage: Number(((optimal / count) * 100).toFixed(1)),
        color: '#10b981',
      },
      {
        band: 'High Nominal',
        range: `${nominalCeiling.toFixed(1)} - ${warnLimit}${metricDef.unit}`,
        count: elevated,
        percentage: Number(((elevated / count) * 100).toFixed(1)),
        color: '#06b6d4',
      },
      {
        band: 'Warning State',
        range: `${warnLimit} - ${critLimit}${metricDef.unit}`,
        count: warning,
        percentage: Number(((warning / count) * 100).toFixed(1)),
        color: '#f59e0b',
      },
      {
        band: 'Critical Excursion',
        range: `≥ ${critLimit}${metricDef.unit}`,
        count: critical,
        percentage: Number(((critical / count) * 100).toFixed(1)),
        color: '#f43f5e',
      },
    ];

    return { bins, mean, stdDev, count };
  }, [data, selectedMetric, activeThresholds, metricDef.decimals, metricDef.unit]);

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-industrial-800">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Operational Band Distribution
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              30-sample frequency distribution for {machineId} ({metricDef.label})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>μ: <strong className="text-white">{distribution.mean}</strong>{metricDef.unit}</span>
          <span>•</span>
          <span>σ: <strong className="text-cyan-300">{distribution.stdDev}</strong></span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution.bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="band"
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
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-industrial-950/95 border border-industrial-700 p-2.5 rounded-lg shadow-xl font-mono text-xs text-white">
                    <div className="font-bold text-cyan-400">{d.band}</div>
                    <div className="text-[11px] text-slate-300">Range: {d.range}</div>
                    <div className="text-[11px] text-slate-300">Samples: {d.count} / {distribution.count}</div>
                    <div className="text-[11px] font-bold mt-1" style={{ color: d.color }}>
                      Share: {d.percentage}%
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {distribution.bins.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Leg / Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {distribution.bins.map((b) => (
          <div
            key={b.band}
            className="bg-industrial-950 p-2 rounded-lg border border-industrial-800/80 flex flex-col justify-between"
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-[10px] text-slate-400 truncate">{b.band}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-white font-bold text-sm">{b.percentage}%</span>
              <span className="text-[10px] text-slate-500">({b.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
