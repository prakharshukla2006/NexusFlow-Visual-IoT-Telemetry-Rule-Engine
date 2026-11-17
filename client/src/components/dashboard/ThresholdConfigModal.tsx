import React, { useState } from 'react';
import { X, Sliders, ShieldAlert, Check, RotateCcw } from 'lucide-react';
import { MetricDefinition, SensorThresholds } from '../../types/telemetry';

interface ThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition: MetricDefinition;
  onSaveThresholds: (thresholds: SensorThresholds) => void;
  onResetDefaults: () => void;
}

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({
  isOpen,
  onClose,
  definition,
  onSaveThresholds,
  onResetDefaults,
}) => {
  const [warningVal, setWarningVal] = useState<number>(definition.thresholds.warning);
  const [criticalVal, setCriticalVal] = useState<number>(definition.thresholds.critical);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveThresholds({
      warning: warningVal,
      critical: criticalVal,
      minNormal: definition.thresholds.minNormal,
    });
    onClose();
  };

  const handleReset = () => {
    onResetDefaults();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-industrial-900 border border-industrial-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Configure {definition.label} Rule Limits
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-industrial-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders / Inputs */}
        <div className="space-y-4 font-mono text-xs">
          {/* Warning Threshold */}
          <div className="bg-industrial-950 p-4 rounded-lg border border-industrial-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Warning Limit (Alert Trigger):
              </span>
              <span className="text-white font-bold text-sm">
                {warningVal.toFixed(definition.decimals)} {definition.unit}
              </span>
            </div>
            <input
              type="range"
              min={definition.thresholds.warning * 0.7}
              max={definition.thresholds.critical * 1.1}
              step={definition.decimals === 2 ? 0.05 : 0.5}
              value={warningVal}
              onChange={(e) => setWarningVal(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-industrial-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Readings exceeding this level flag a warning on the dashboard and trigger supervisory notice.
            </p>
          </div>

          {/* Critical Threshold */}
          <div className="bg-industrial-950 p-4 rounded-lg border border-industrial-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Critical Limit (Emergency Action):
              </span>
              <span className="text-white font-bold text-sm">
                {criticalVal.toFixed(definition.decimals)} {definition.unit}
              </span>
            </div>
            <input
              type="range"
              min={warningVal}
              max={definition.thresholds.critical * 1.3}
              step={definition.decimals === 2 ? 0.05 : 0.5}
              value={criticalVal}
              onChange={(e) => setCriticalVal(parseFloat(e.target.value))}
              className="w-full accent-rose-500 bg-industrial-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Readings exceeding this boundary trigger immediate critical alerts, mock SMS, and webhooks.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-industrial-800 text-xs font-mono">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-industrial-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-industrial-700 text-slate-300 hover:bg-industrial-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-lg shadow-cyan-900/30"
            >
              <Check className="w-4 h-4" />
              <span>Apply Rule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
