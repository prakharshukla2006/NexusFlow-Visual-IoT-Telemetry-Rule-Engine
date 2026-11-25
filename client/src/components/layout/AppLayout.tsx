import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  activeAlertCount?: number;
  onOpenWsDiagnostics?: () => void;
  wsStatus?: string;
  feedMode?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentTab,
  onSelectTab,
  activeAlertCount = 2,
  onOpenWsDiagnostics,
  wsStatus,
  feedMode,
}) => {
  const [internalTab, setInternalTab] = useState<string>('dashboard');
  const activeTab = currentTab ?? internalTab;
  const handleSelectTab = onSelectTab ?? setInternalTab;

  return (
    <div className="flex h-screen bg-industrial-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar currentTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          activeAlertCount={activeAlertCount}
          onOpenWsDiagnostics={onOpenWsDiagnostics}
          wsStatus={wsStatus}
          feedMode={feedMode}
        />
        
        {/* Dynamic Page Viewport with Industrial Grid Background */}
        <main className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(#162238_1px,transparent_1px)] [background-size:24px_24px] bg-industrial-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
