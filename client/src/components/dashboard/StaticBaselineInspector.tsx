import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Scale,
  TrendingUp,
  TrendingDown,
  Layers,
  Info,
} from 'lucide-react';
import { MetricType } from '../../types/telemetry';
import { METRIC_DEFINITIONS } from '../../data/mockTelemetry';

interface StaticBaselineInspectorProps {
  currentValue: number;
  metric: MetricType;
  machineId: string;
  isStaticMode: boolean;
  onToggleStaticMode: () => void;
}

interface BaselineProfile {
  id: string;
  name: string;
  description: string;
  meanValue: number;
  tolerance: number;
  stdDev: number;
}

export const StaticBaselineInspector: React.FC<StaticBaselineInspectorProps> = ({
  currentValue,
  metric,
  machineId,
  isStaticMode,
  onToggleStaticMode,
}) => {
  const metricDef = METRIC_DEFINITIONS[metric];

  // Static baseline reference profiles for Week 2 calibration
  const baselineProfiles: Record<MetricType, BaselineProfile[]> = {
    temperature: [
      { id: 'nom', name: 'Nominal Factory Run (ISO 10816)', description: 'Calibrated factory standard at 100% rated load', meanValue: 81.5, tolerance: 3.5, stdDev: 0.8 },
      { id: 'therm', name: 'High-Ambient Summer Profile', description: 'Extreme external temperature benchmark', meanValue: 84.0, tolerance: 2.0, stdDev: 1.2 },
      { id: 'idle', name: 'Low-Load Idle Baseline', description: 'Zero-power spin-down calibration curve', meanValue: 65.0, tolerance: 5.0, stdDev: 0.5 },
    ],
    vibration: [
      { id: 'nom', name: 'Class I Rigid Foundation (ISO)', description: 'Permissible vibration baseline for smooth turbomachinery', meanValue: 2.2, tolerance: 1.0, stdDev: 0.15 },
      { id: 'crit', name: 'Resonance Harmonic Boundary', description: 'Sub-harmonic vibration limit threshold', meanValue: 3.4, tolerance: 0.5, stdDev: 0.3 },
    ],
    pressure: [
      { id: 'nom', name: 'Hydraulic Normal Operating Pressure', description: 'Calibrated system accumulator pressure', meanValue: 125.0, tolerance: 10.0, stdDev: 2.1 },
    ],
    rpm: [
      { id: 'nom', name: 'Synchronous Grid Speed (50Hz / 3000 RPM)', description: 'Standard power generation frequency lock', meanValue: 3000, tolerance: 60, stdDev: 12 },
    ],
    power: [
      { id: 'nom', name: 'Rated Output Capacity (450 kW)', description: 'Nominal full-load turbine generation', meanValue: 450.0, tolerance: 25.0, stdDev: 5.0 },
    ],
  };

  const profiles = baselineProfiles[metric] || baselineProfiles.temperature;
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0].id);

  // Sync selected profile whenever the active metric changes
  useEffect(() => {
    setSelectedProfileId(profiles[0].id);
  }, [metric]);

  const activeProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Calculate live delta from static baseline
  const delta = currentValue - activeProfile.meanValue;
  const deltaPct = ((delta / activeProfile.meanValue) * 100).toFixed(1);
  const isWithinTolerance = Math.abs(delta) <= activeProfile.tolerance;

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-industrial-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <Scale className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Static Baseline Calibration & Delta Comparator
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Week 2 Milestone
          </span>
        </div>

        {/* Static Mode Toggle Button */}
        <button
          onClick={onToggleStaticMode}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
            isStaticMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isStaticMode ? 'ACTIVE: STATIC BASELINE' : 'SWITCH TO STATIC MODE'}</span>
        </button>
      </div>

      {/* Profile Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-400 uppercase mr-1 shrink-0">
          Static Profile:
        </span>
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProfileId(p.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
              selectedProfileId === p.id
                ? 'bg-industrial-800 text-white font-semibold border-amber-500/50 shadow-sm'
                : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:text-slate-300'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Baseline Reference Target */}
        <div className="bg-industrial-950 p-3.5 rounded-lg border border-industrial-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Static Reference Mean</div>
          <div className="text-lg font-bold text-white">
            {activeProfile.meanValue.toFixed(metricDef.decimals)} {metricDef.unit}
          </div>
          <div className="text-[11px] text-slate-400">
            Tolerance: ±{activeProfile.tolerance} {metricDef.unit} (σ = {activeProfile.stdDev})
          </div>
        </div>

        {/* Current Live / Inspected Value */}
        <div className="bg-industrial-950 p-3.5 rounded-lg border border-industrial-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Current Reading ({machineId})</div>
          <div className="text-lg font-bold text-white">
            {currentValue.toFixed(metricDef.decimals)} {metricDef.unit}
          </div>
          <div className="text-[11px] text-slate-400">
            Sensor: {metricDef.label}
          </div>
        </div>

        {/* Computed Delta & Tolerance Verdict */}
        <div className="bg-industrial-950 p-3.5 rounded-lg border border-industrial-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase">Baseline Deviation (Δ)</div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-lg font-bold ${
                isWithinTolerance ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {delta >= 0 ? `+${delta.toFixed(metricDef.decimals)}` : delta.toFixed(metricDef.decimals)} {metricDef.unit}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                isWithinTolerance
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-rose-500/10 text-rose-300'
              }`}
            >
              {delta >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
            </span>
          </div>
          <div className="text-[11px] flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isWithinTolerance ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'
              }`}
            />
            <span className={isWithinTolerance ? 'text-emerald-400' : 'text-rose-400'}>
              {isWithinTolerance ? 'Within Nominal Calibration Band' : 'Deviation Out of Tolerance'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 bg-industrial-950/60 p-2.5 rounded-lg border border-industrial-800/80 flex items-center space-x-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          {activeProfile.description}. In Static Mode, Recharts renders this fixed baseline without streaming jitter, enabling precise machine wear tracking.
        </span>
      </div>
    </div>
  );
};
