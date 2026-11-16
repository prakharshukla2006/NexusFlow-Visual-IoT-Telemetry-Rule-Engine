import React from 'react';
import { RuleAlertEvent } from '../../types/telemetry';
import { getSeverityBadge } from '../../utils/formatters';
import {
  BellRing,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Radio,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface RecentAlertsFeedProps {
  alerts: RuleAlertEvent[];
  onAcknowledgeAlert: (id: string) => void;
}

export const RecentAlertsFeed: React.FC<RecentAlertsFeedProps> = ({
  alerts,
  onAcknowledgeAlert,
}) => {
  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-industrial-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <BellRing className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Real-Time Rule Alerts & Action Integrations
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Member 4 Scope
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Auto-Dispatch: Enabled
        </span>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-mono text-xs">
            No active alert anomalies triggered. All machine telemetry within nominal ranges.
          </div>
        ) : (
          alerts.map((alert) => {
            const badge = getSeverityBadge(alert.severity);

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  alert.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-900/60'
                    : alert.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-900/60'
                    : 'bg-industrial-850 border-industrial-800'
                }`}
              >
                {/* Left: Severity & Details */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    <span className="font-mono text-xs text-white font-semibold">
                      {alert.ruleName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      [{alert.id}]
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-cyan-300">{alert.machineName} ({alert.machineId})</span>:
                    {' '}Metric reading reached <span className="font-mono text-white font-bold">{alert.actualValue}</span> exceeding threshold of <span className="font-mono text-slate-400">{alert.threshold}</span>.
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>Triggered: {alert.timestamp}</span>
                    <span>•</span>
                    <span className="text-cyan-400 flex items-center space-x-1">
                      {alert.actionType === 'mock_sms' && <MessageSquare className="w-3 h-3 inline mr-1" />}
                      {alert.actionType === 'webhook' && <Send className="w-3 h-3 inline mr-1" />}
                      <span>Action: {alert.actionDestination}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Action Status & Ack Button */}
                <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-1 rounded border ${
                      alert.actionStatus === 'mock_sms_sent'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : alert.actionStatus === 'webhook_delivered'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-industrial-800 text-slate-400 border-industrial-700'
                    }`}
                  >
                    {alert.actionStatus.toUpperCase().replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all border ${
                      alert.acknowledged
                        ? 'bg-industrial-800/50 text-slate-400 border-industrial-700 cursor-default'
                        : 'bg-industrial-800 hover:bg-industrial-700 text-slate-200 border-industrial-600 hover:text-white'
                    }`}
                  >
                    {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
