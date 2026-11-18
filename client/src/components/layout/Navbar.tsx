import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Activity,
  Radio,
  Server,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface NavbarProps {
  activeAlertCount: number;
  onOpenAlertsModal?: () => void;
  onOpenWsDiagnostics?: () => void;
  wsStatus?: string;
  feedMode?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeAlertCount,
  onOpenAlertsModal,
  onOpenWsDiagnostics,
  wsStatus = 'STREAMING',
  feedMode = 'live_websocket',
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-industrial-900/90 backdrop-blur border-b border-industrial-800 px-6 flex items-center justify-between shrink-0">
      {/* Breadcrumb & Section Name */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">NEXUSFLOW</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-semibold tracking-wider">TELEMETRY MONITOR</span>
        </div>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          Plant Sector Alpha
        </span>
      </div>

      {/* Action / Telemetry Status Indicators */}
      <div className="flex items-center space-x-4">
        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-industrial-850 border border-industrial-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeString || '--:--:--'}</span>
          <span className="text-[10px] text-slate-400">LOC</span>
        </div>

        {/* Throughput Target Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-industrial-850 border border-industrial-800 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Target Influx:</span>
          <span className="text-emerald-400 font-medium">5,000 writes/s</span>
        </div>

        {/* WebSocket Pipeline Indicator / Diagnostics Trigger */}
        <button
          onClick={onOpenWsDiagnostics}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-industrial-850 hover:bg-industrial-800 border border-industrial-800 hover:border-cyan-500/40 text-xs font-mono transition-all cursor-pointer"
          title="Click to view WebSocket telemetry gateway diagnostics"
        >
          <Radio className={`w-3.5 h-3.5 ${wsStatus === 'connected' || wsStatus === 'STREAMING' ? 'text-cyan-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="text-slate-400">WS:</span>
          <span className={wsStatus === 'connected' || wsStatus === 'STREAMING' ? 'text-cyan-300 font-semibold' : 'text-amber-300'}>
            {feedMode === 'static_baseline' ? 'STATIC' : wsStatus.toUpperCase()}
          </span>
        </button>

        {/* Notifications & Alert Trigger */}
        <button
          onClick={onOpenAlertsModal}
          className="relative p-2 rounded-lg bg-industrial-850 hover:bg-industrial-800 border border-industrial-800 text-slate-300 hover:text-white transition-colors"
          title="View active alerts"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-mono font-bold text-white items-center justify-center">
                {activeAlertCount}
              </span>
            </span>
          )}
        </button>

        {/* User Identity / Role Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-industrial-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            PS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200">Prakhar Shukla</div>
            <div className="text-[10px] font-mono text-cyan-400">Member 4 (Dashboard Lead)</div>
          </div>
        </div>
      </div>
    </header>
  );
};
