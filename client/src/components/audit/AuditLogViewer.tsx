import React, { useState } from 'react';
import {
  FileCode,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Radio,
  Layers,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'DAG';
  source: string;
  message: string;
  metadata?: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-101',
    timestamp: '20:45:12.802',
    level: 'INFO',
    source: 'WebSocketHub',
    message: 'Client session connected via RFC 6455 gateway (/ws/telemetry)',
    metadata: 'RTT: 12ms • Protocol: v1.0.0',
  },
  {
    id: 'LOG-102',
    timestamp: '20:45:13.110',
    level: 'INFO',
    source: 'TelemetryIngest',
    message: 'Machine T-101 telemetry frame broadcasted [Temp: 86.4°C, Vib: 2.85 mm/s]',
    metadata: '5-sample SMA: 84.8°C',
  },
  {
    id: 'LOG-103',
    timestamp: '20:45:15.420',
    level: 'DAG',
    source: 'GraphValidator',
    message: 'Workflow "Turbine Overheat Protection" validated: 4 nodes, 3 edges, 0 cycles detected',
    metadata: 'Topological order: src-1 -> ma-1 -> thresh-1 -> act-1',
  },
  {
    id: 'LOG-104',
    timestamp: '20:45:16.002',
    level: 'WARN',
    source: 'RuleEngine',
    message: 'Machine T-101 temperature exceeded warning threshold (>80.0°C)',
    metadata: 'Current: 82.3°C • Limit: 80.0°C',
  },
  {
    id: 'LOG-105',
    timestamp: '20:45:18.514',
    level: 'CRIT',
    source: 'RuleEngine',
    message: 'Critical excursion detected: T-101 bearing temperature sustained at 86.4°C (>85.0°C)',
    metadata: 'Dispatched Web Audio alarm & webhook trigger payload',
  },
  {
    id: 'LOG-106',
    timestamp: '20:45:20.100',
    level: 'INFO',
    source: 'BenchmarkAudit',
    message: 'Ingestion benchmark completed: 10,000 frames evaluated at 146,842 writes/sec',
    metadata: 'Heap allocation delta: +0.28 MB',
  },
];

export const AuditLogViewer: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        log.source.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        log.metadata?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">Audit & Stream Telemetry Logs</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Trace Audit Log
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic operational event stream logging telemetry ticks, DAG validation passes, and alert dispatches
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-industrial-950 border border-industrial-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded-lg p-1 text-xs">
            {['ALL', 'INFO', 'WARN', 'CRIT', 'DAG'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded transition ${
                  filterLevel === lvl
                    ? 'bg-industrial-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-industrial-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-industrial-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Subsystem</th>
                <th className="py-2.5 px-3">Event Description</th>
                <th className="py-2.5 px-3">Telemetry Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/60 text-slate-300 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-industrial-850/40 transition">
                  <td className="py-3 px-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        log.level === 'CRIT'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : log.level === 'DAG'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyan-300 font-semibold">{log.source}</td>
                  <td className="py-3 px-3 font-sans text-xs text-slate-200">{log.message}</td>
                  <td className="py-3 px-3 text-slate-400">{log.metadata || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
