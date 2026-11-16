import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Radio,
  BellRing,
  FileCode,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Live Telemetry Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'canvas', label: 'Visual Rule Canvas', icon: GitBranch, badge: 'RxJS' },
    { id: 'ingestion', label: 'Time Series Ingestion', icon: Radio, badge: 'MongoDB' },
    { id: 'alerts', label: 'Alert Actions & Rules', icon: BellRing, badge: '3 Active' },
    { id: 'audit', label: 'Audit & Stream Logs', icon: FileCode },
  ];

  return (
    <aside className="w-64 bg-industrial-900 border-r border-industrial-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-industrial-800 bg-industrial-950/60">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mr-3 shrink-0">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold tracking-wider text-base text-white">NEXUS</span>
            <span className="font-light tracking-wider text-base text-cyan-400">FLOW</span>
          </div>
          <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
            IIoT Telemetry Engine
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Core Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-850 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                      : 'bg-industrial-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Engineering Scope
        </div>
        <div className="bg-industrial-850/70 border border-industrial-800 rounded-lg p-3 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              Project Member 4
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Week 1
            </span>
          </div>
          <p className="text-slate-300 font-medium leading-tight">
            Real-Time Dashboard & Alert Integration
          </p>
          <div className="pt-1 border-t border-industrial-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Chart Lib:</span>
              <span className="font-mono text-cyan-300">Recharts (ADR-001)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Layout:</span>
              <span className="font-mono text-emerald-400">SCADA Grid v1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-industrial-800 bg-industrial-950/40">
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-industrial-900 border border-industrial-800 text-[11px] font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Engine Online</span>
          </div>
          <span className="text-slate-400">v1.0.0-w1</span>
        </div>
      </div>
    </aside>
  );
};
