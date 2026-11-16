import React from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Radio, Gauge } from 'lucide-react';
import { MachineDevice } from '../../types/telemetry';

interface SystemHealthBannerProps {
  selectedMachine: MachineDevice;
  totalMachines: number;
  anomalyCount: number;
}

export const SystemHealthBanner: React.FC<SystemHealthBannerProps> = ({
  selectedMachine,
  totalMachines,
  anomalyCount,
}) => {
  const isWarning = selectedMachine.status === 'warning' || selectedMachine.status === 'critical';

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div
        className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isWarning ? 'bg-amber-500' : 'bg-cyan-500'
        }`}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Left: Selected Machine Identity */}
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded bg-industrial-800 text-cyan-400 font-mono text-xs font-semibold border border-industrial-700">
              UNIT ID: {selectedMachine.id}
            </span>
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                selectedMachine.status === 'operational'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedMachine.status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="capitalize">{selectedMachine.status} Status</span>
            </span>
            <span className="text-slate-400 text-xs font-mono hidden sm:inline">
              Sector: {selectedMachine.location}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            {selectedMachine.name}
            <span className="text-xs font-mono font-normal text-slate-400">
              ({selectedMachine.model})
            </span>
          </h2>
        </div>

        {/* Right: Telemetry Health Indicators */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {/* Health Score Gauge */}
          <div className="bg-industrial-850 px-4 py-2 rounded-lg border border-industrial-800 flex items-center space-x-3">
            <div className="text-left">
              <div className="text-slate-400 text-[10px] uppercase">Unit Health</div>
              <div className="text-base font-bold text-white">
                {selectedMachine.healthScore}%
              </div>
            </div>
            <div className="w-16 h-2 bg-industrial-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedMachine.healthScore > 90
                    ? 'bg-emerald-400'
                    : selectedMachine.healthScore > 75
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${selectedMachine.healthScore}%` }}
              />
            </div>
          </div>

          {/* Active Anomalies Indicator */}
          <div className="bg-industrial-850 px-4 py-2 rounded-lg border border-industrial-800 flex items-center space-x-3">
            <AlertTriangle
              className={`w-4 h-4 ${anomalyCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`}
            />
            <div className="text-left">
              <div className="text-slate-400 text-[10px] uppercase">Rule Anomaly</div>
              <div className={`text-base font-bold ${anomalyCount > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                {anomalyCount > 0 ? `${anomalyCount} Triggered` : 'Nominal'}
              </div>
            </div>
          </div>

          {/* Sensor Influx Ping */}
          <div className="bg-industrial-850 px-4 py-2 rounded-lg border border-industrial-800 flex items-center space-x-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-slate-400 text-[10px] uppercase">Telemetry Latency</div>
              <div className="text-base font-bold text-cyan-300">8.4 ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
