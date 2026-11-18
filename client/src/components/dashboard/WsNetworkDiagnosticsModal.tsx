import React, { useState } from 'react';
import {
  X,
  Radio,
  Server,
  Activity,
  ArrowDownUp,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { WsNetworkStats, TelemetryFeedMode } from '../../types/telemetry';

interface WsNetworkDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkStats: WsNetworkStats;
  feedMode: TelemetryFeedMode;
  onChangeFeedMode: (mode: TelemetryFeedMode) => void;
  onReconnect: () => void;
  selectedMachineId: string;
}

export const WsNetworkDiagnosticsModal: React.FC<WsNetworkDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  networkStats,
  feedMode,
  onChangeFeedMode,
  onReconnect,
  selectedMachineId,
}) => {
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Send a test sensor ingestion event via HTTP REST endpoint to test end-to-end WebSocket broadcast
  const handleSendTestIngest = async () => {
    try {
      setIngestStatus('Sending test sensor frame to /api/telemetry/ingest...');
      const response = await fetch('http://localhost:4000/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: selectedMachineId,
          temperature: 87.5, // Anomaly trigger
          vibration: 3.6,
          pressure: 126.0,
          rpm: 3250,
          power: 455.0,
        }),
      });

      if (response.ok) {
        setIngestStatus('Frame ingested! Broadcasted over WebSocket hub.');
      } else {
        setIngestStatus('Gateway returned non-200 (server may be offline)');
      }
    } catch (err) {
      setIngestStatus('Gateway offline. Live simulation continues in standalone mode.');
    }
  };

  const isConnected = networkStats.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-mono">
      <div className="bg-industrial-900 border border-industrial-700 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide">
              WebSocket Telemetry Gateway Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-industrial-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector: Live WS Stream vs Static Baseline */}
        <div className="bg-industrial-950 p-3.5 rounded-lg border border-industrial-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold uppercase">Dashboard Feed Mode:</span>
            <div className="flex items-center bg-industrial-900 p-0.5 rounded border border-industrial-700">
              <button
                onClick={() => onChangeFeedMode('live_websocket')}
                className={`px-3 py-1 rounded text-[11px] transition-all ${
                  feedMode === 'live_websocket'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ● Live WebSocket
              </button>
              <button
                onClick={() => onChangeFeedMode('static_baseline')}
                className={`px-3 py-1 rounded text-[11px] transition-all ${
                  feedMode === 'static_baseline'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Static Baseline
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            {feedMode === 'live_websocket'
              ? 'Receiving continuous live telemetry frames pushed from Node.js backend.'
              : 'Rendering fixed static baseline datasets for calibration and offline verification (Week 2 milestone).'}
          </p>
        </div>

        {/* Connection Diagnostics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Socket Status</span>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-400 animate-pulse'
                    : networkStats.status === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span className="font-bold text-white capitalize">{networkStats.status}</span>
            </div>
          </div>

          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Round-Trip Latency (RTT)</span>
            <div className="text-white font-bold text-sm">
              {isConnected ? `${networkStats.latencyMs} ms` : 'N/A (Offline)'}
            </div>
          </div>

          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Frames Ingested</span>
            <div className="text-cyan-300 font-bold text-sm">
              {networkStats.messagesReceived.toLocaleString()}
            </div>
          </div>

          <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase">Active Subscription</span>
            <div className="text-white font-bold text-sm">
              Unit {selectedMachineId}
            </div>
          </div>
        </div>

        {/* Server Endpoint Details */}
        <div className="bg-industrial-950/80 p-3 rounded-lg border border-industrial-800/80 text-[11px] space-y-1.5 text-slate-400">
          <div className="flex justify-between">
            <span>WebSocket URI:</span>
            <span className="text-slate-200">{networkStats.serverUrl}</span>
          </div>
          <div className="flex justify-between">
            <span>REST Gateway:</span>
            <span className="text-slate-200">http://localhost:4000/api</span>
          </div>
          <div className="flex justify-between">
            <span>Client Session ID:</span>
            <span className="text-cyan-400">{networkStats.clientId || 'anonymous-scada'}</span>
          </div>
        </div>

        {/* Test Ingestion Section */}
        <div className="bg-industrial-950 p-3 rounded-lg border border-industrial-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Test Ingestion Pipeline:</span>
            <button
              onClick={handleSendTestIngest}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-industrial-800 hover:bg-industrial-700 text-cyan-300 border border-industrial-700 text-[11px]"
            >
              <Send className="w-3 h-3" />
              <span>Submit Spike</span>
            </button>
          </div>
          {ingestStatus && (
            <p className="text-[10px] text-cyan-400 bg-industrial-900 p-1.5 rounded border border-industrial-800">
              {ingestStatus}
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-industrial-800 text-xs">
          <button
            onClick={onReconnect}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-industrial-700 hover:bg-industrial-800 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reconnect Gateway</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
