import React from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Columns,
  Square,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface StreamPlaybackControlsProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  streamSpeed: number; // 0.5, 1, 2
  onChangeSpeed: (speed: number) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  viewMode: 'single' | 'dual' | 'fleet';
  onChangeViewMode: (mode: 'single' | 'dual' | 'fleet') => void;
  highlightAnomalies: boolean;
  onToggleHighlightAnomalies: () => void;
}

export const StreamPlaybackControls: React.FC<StreamPlaybackControlsProps> = ({
  isStreaming,
  onToggleStreaming,
  streamSpeed,
  onChangeSpeed,
  audioEnabled,
  onToggleAudio,
  viewMode,
  onChangeViewMode,
  highlightAnomalies,
  onToggleHighlightAnomalies,
}) => {
  return (
    <div className="bg-industrial-900/90 border border-industrial-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md">
      {/* Stream Play/Pause & Speed */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleStreaming}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            isStreaming
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
          }`}
        >
          {isStreaming ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE INFLUX</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>RESUME INFLUX</span>
            </>
          )}
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-industrial-950 p-0.5 rounded-lg border border-industrial-800">
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-1 rounded transition-colors ${
                streamSpeed === spd
                  ? 'bg-industrial-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Center: View Mode (Single Focus vs Dual Synchronized vs Fleet Comparative) */}
      <div className="flex items-center space-x-2">
        <span className="text-slate-400 text-[11px] uppercase mr-1 hidden sm:inline">
          Recharts Layout:
        </span>
        <div className="flex items-center bg-industrial-950 p-0.5 rounded-lg border border-industrial-800">
          <button
            onClick={() => onChangeViewMode('single')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all ${
              viewMode === 'single'
                ? 'bg-industrial-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Single-metric area chart with timeline scrubber"
          >
            <Square className="w-3 h-3" />
            <span>Focus</span>
          </button>
          <button
            onClick={() => onChangeViewMode('dual')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all ${
              viewMode === 'dual'
                ? 'bg-industrial-800 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dual synchronized thermal-mechanical charts"
          >
            <Columns className="w-3 h-3" />
            <span>Dual Sync</span>
          </button>
          <button
            onClick={() => onChangeViewMode('fleet')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all ${
              viewMode === 'fleet'
                ? 'bg-industrial-800 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Fleet multi-unit comparative overlay"
          >
            <Layers className="w-3 h-3" />
            <span>Fleet</span>
          </button>
        </div>
      </div>

      {/* Right: Audio & Anomaly Markers */}
      <div className="flex items-center space-x-2">
        {/* Anomaly Highlight Toggle */}
        <button
          onClick={onToggleHighlightAnomalies}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            highlightAnomalies
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:text-slate-300'
          }`}
          title="Highlight points exceeding warning thresholds"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Anomalies</span>
        </button>

        {/* Audio Alarm Button */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            audioEnabled
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              : 'bg-industrial-950 text-slate-400 border-industrial-800 hover:text-slate-300'
          }`}
          title="Toggle SCADA audio alarm beacon for critical threshold violations"
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alarm Sound: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Alarm Sound: OFF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
