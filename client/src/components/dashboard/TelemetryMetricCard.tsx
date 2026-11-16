import React from 'react';
import {
  Thermometer,
  Activity,
  Gauge,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import { MetricDefinition, MetricType } from '../../types/telemetry';

interface TelemetryMetricCardProps {
  definition: MetricDefinition;
  currentValue: number;
  movingAverage?: number;
  historicalPoints?: number[];
  isSelected?: boolean;
  onSelect?: () => void;
}

export const TelemetryMetricCard: React.FC<TelemetryMetricCardProps> = ({
  definition,
  currentValue,
  movingAverage,
  historicalPoints = [],
  isSelected = false,
  onSelect,
}) => {
  const isCritical = currentValue >= definition.thresholds.critical;
  const isWarning = !isCritical && currentValue >= definition.thresholds.warning;

  // Icon mapping
  const renderIcon = () => {
    switch (definition.key) {
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-rose-400" />;
      case 'vibration':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'pressure':
        return <Gauge className="w-5 h-5 text-cyan-400" />;
      case 'rpm':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  // Sparkline coordinates
  const sparklineSvg = () => {
    if (historicalPoints.length < 2) return null;
    const min = Math.min(...historicalPoints);
    const max = Math.max(...historicalPoints);
    const range = max - min || 1;
    const width = 120;
    const height = 32;

    const points = historicalPoints
      .map((val, idx) => {
        const x = (idx / (historicalPoints.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-28 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={definition.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-4 transition-all cursor-pointer relative overflow-hidden border ${
        isSelected
          ? 'bg-industrial-850 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
          : 'bg-industrial-900 border-industrial-800 hover:border-industrial-700 hover:bg-industrial-850/80'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-industrial-800/80 border border-industrial-700/60">
            {renderIcon()}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 tracking-wide">
              {definition.label}
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Metric: {definition.key}
            </span>
          </div>
        </div>

        {/* Severity Badge */}
        {isCritical ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        ) : isWarning ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span>WARNING</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>NORMAL</span>
          </span>
        )}
      </div>

      {/* Main Metric Value & Sparkline */}
      <div className="flex items-end justify-between my-2">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono tracking-tight text-white">
              {currentValue.toFixed(definition.decimals)}
            </span>
            <span className="text-sm font-mono text-slate-400 font-medium">
              {definition.unit}
            </span>
          </div>
          {movingAverage !== undefined && (
            <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center space-x-1">
              <span>MA(5):</span>
              <span className="text-cyan-300 font-semibold">
                {movingAverage.toFixed(definition.decimals)} {definition.unit}
              </span>
            </div>
          )}
        </div>

        {/* Mini Sparkline Chart */}
        <div className="hidden sm:block">{sparklineSvg()}</div>
      </div>

      {/* Threshold Rules Indicator */}
      <div className="pt-2.5 mt-2 border-t border-industrial-800 text-[10px] font-mono flex items-center justify-between text-slate-400">
        <div>
          <span>Warn: </span>
          <span className="text-amber-400">{definition.thresholds.warning}</span>
        </div>
        <div>
          <span>Crit: </span>
          <span className="text-rose-400">{definition.thresholds.critical}</span>
        </div>
        <div className="text-slate-400">
          Rule active
        </div>
      </div>
    </div>
  );
};
