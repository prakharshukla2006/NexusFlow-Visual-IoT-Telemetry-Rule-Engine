import React from 'react';
import { MachineDevice } from '../../types/telemetry';
import { getStatusColorClass } from '../../utils/formatters';

interface DeviceFilterBarProps {
  machines: MachineDevice[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
}

export const DeviceFilterBar: React.FC<DeviceFilterBarProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-mono uppercase text-slate-400 shrink-0 mr-1">
        Fleet Devices:
      </span>
      {machines.map((machine) => {
        const isSelected = machine.id === selectedMachineId;
        const statusColors = getStatusColorClass(machine.status);

        return (
          <button
            key={machine.id}
            onClick={() => onSelectMachine(machine.id)}
            className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border ${
              isSelected
                ? 'bg-industrial-800 text-cyan-300 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                : 'bg-industrial-900/80 text-slate-400 hover:text-slate-200 hover:bg-industrial-850 border-industrial-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${statusColors.dot}`} />
            <span className="font-mono font-semibold">{machine.id}</span>
            <span className="text-slate-400 hidden sm:inline text-[11px]">
              {machine.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {machine.metrics.temperature.toFixed(0)}°C
            </span>
          </button>
        );
      })}
    </div>
  );
};
