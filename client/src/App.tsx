import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-industrial-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>NEXUSFLOW TELEMETRY PLATFORM</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Real-Time Dashboard & Alert Integration
        </h1>
        <p className="text-slate-400 text-sm">
          Scaffolding initialized for Member 4 Week 1 milestones.
        </p>
      </div>
    </div>
  );
};

export default App;
