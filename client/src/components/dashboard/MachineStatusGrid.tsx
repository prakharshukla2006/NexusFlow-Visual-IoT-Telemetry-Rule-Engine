import React from 'react';
import { MachineDevice } from '../../types/telemetry';
import { getStatusColorClass } from '../../utils/formatters';
import { ChevronRight, Cpu, Radio, ShieldCheck } from 'lucide-react';

interface MachineStatusGridProps {
  machines: MachineDevice[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
}

export const MachineStatusGrid: React.FC<MachineStatusGridProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
}) => {
  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-industrial-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Industrial Fleet Status
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-industrial-800 text-slate-300 border border-industrial-700">
            {machines.length} Units Online
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Telemetry Polling: Active
        </span>
      </div>

      {/* Grid of Machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {machines.map((machine) => {
          const isSelected = machine.id === selectedMachineId;
          const statusColors = getStatusColorClass(machine.status);

          return (
            <div
              key={machine.id}
              onClick={() => onSelectMachine(machine.id)}
              className={`rounded-xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? 'bg-industrial-850 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                  : 'bg-industrial-950/70 border-industrial-800 hover:border-industrial-700 hover:bg-industrial-850/50'
              }`}
            >
              <div>
                {/* Header: ID + Status Dot */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-industrial-800 text-cyan-300 border border-industrial-700">
                    {machine.id}
                  </span>
                  <div
                    className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                    <span className="capitalize">{machine.status}</span>
                  </div>
                </div>

                {/* Machine Name & Category */}
                <h4 className="font-bold text-sm text-white truncate">{machine.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{machine.location}</p>

                {/* Instantaneous Sensor Metrics Summary */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono bg-industrial-900/90 p-2.5 rounded-lg border border-industrial-800/80">
                  <div>
                    <span className="text-slate-400 text-[10px]">TEMP:</span>
                    <div className="text-white font-semibold">
                      {machine.metrics.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">VIB:</span>
                    <div className="text-white font-semibold">
                      {machine.metrics.vibration.toFixed(2)} mm/s
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">PRESS:</span>
                    <div className="text-white font-semibold">
                      {machine.metrics.pressure.toFixed(1)} bar
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">RPM:</span>
                    <div className="text-white font-semibold">
                      {machine.metrics.rpm}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Health Score Bar */}
              <div className="mt-4 pt-3 border-t border-industrial-800/80">
                <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                  <span>Health Index:</span>
                  <span className="text-white font-semibold">{machine.healthScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-industrial-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      machine.healthScore > 90
                        ? 'bg-emerald-400'
                        : machine.healthScore > 75
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${machine.healthScore}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
