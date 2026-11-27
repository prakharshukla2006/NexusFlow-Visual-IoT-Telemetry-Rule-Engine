import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sliders,
  ShieldAlert,
  Flame,
  Activity,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { RuleAlertEvent, SensorThresholds, MetricType } from '../../types/telemetry';
import { audioAlert } from '../../utils/audioAlert';

interface AlertRulesManagerProps {
  alerts: RuleAlertEvent[];
  onAcknowledgeAlert: (id: string) => void;
  thresholdOverrides: Record<string, SensorThresholds>;
  onOpenThresholdModal: () => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const AlertRulesManager: React.FC<AlertRulesManagerProps> = ({
  alerts,
  onAcknowledgeAlert,
  thresholdOverrides,
  onOpenThresholdModal,
  audioEnabled = true,
  onToggleAudio,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [audioTesting, setAudioTesting] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length;
  const ackCount = alerts.filter((a) => a.acknowledged).length;

  const handleTestAudio = async () => {
    setAudioTesting(true);
    await audioAlert.testAlarm();
    if (!audioEnabled && onToggleAudio) {
      onToggleAudio();
    }
    setTimeout(() => setAudioTesting(false), 900);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">Alert Rules & Action Center</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SCADA Safety Guard
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage reactive rule thresholds, audio alarm beacons, and real-time plant alert feeds
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                audioEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
              }`}
              title="Toggle alarm audio beacon"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Alarm Audio: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Alarm Audio: MUTED</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleTestAudio}
            disabled={audioTesting}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              audioTesting
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-900/50 animate-pulse'
                : 'bg-industrial-800 hover:bg-industrial-750 text-slate-200 border-industrial-700'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{audioTesting ? 'Playing 880Hz Siren...' : 'Test Web Audio Alarm'}</span>
          </button>
          <button
            onClick={onOpenThresholdModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm shadow-cyan-900"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Thresholds</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Ingested Alerts</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{alerts.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Live WebSocket feed + local rules</div>
        </div>

        <div className="bg-industrial-900 border border-rose-950/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>Active Critical</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-300">{criticalCount}</div>
          <div className="text-[10px] text-rose-400/70 mt-1">Siren & webhook dispatch armed</div>
        </div>

        <div className="bg-industrial-900 border border-amber-950/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Active Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300">{warningCount}</div>
          <div className="text-[10px] text-amber-400/70 mt-1">Approaching tolerance boundary</div>
        </div>

        <div className="bg-industrial-900 border border-emerald-950/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Acknowledged</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-300">{ackCount}</div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Operator reviewed</div>
        </div>
      </div>

      {/* Main Alerts Table & Filters */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Live Dispatched Alerts Stream</h3>
          </div>

          <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded transition ${
                filterSeverity === 'all' ? 'bg-industrial-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded transition ${
                filterSeverity === 'critical' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded transition ${
                filterSeverity === 'warning' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Warning ({warningCount})
            </button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No active alerts matching filter. All systems operating within normal ISO tolerance bands.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-industrial-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-industrial-800">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Rule Name</th>
                  <th className="py-2.5 px-3">Machine</th>
                  <th className="py-2.5 px-3">Reading</th>
                  <th className="py-2.5 px-3">Threshold Limit</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/60 text-slate-300">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-industrial-850/40 transition">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <span>{alert.severity}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{alert.ruleName}</td>
                    <td className="py-3 px-3 font-mono text-cyan-300">{alert.machineId}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-rose-400">
                      {alert.actualValue.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      &gt; {alert.threshold.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {alert.timestamp}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {alert.acknowledged ? (
                        <span className="text-[11px] font-mono text-emerald-400 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acknowledged</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded text-[11px] font-medium bg-industrial-800 hover:bg-industrial-700 text-slate-200 border border-industrial-700 transition"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
