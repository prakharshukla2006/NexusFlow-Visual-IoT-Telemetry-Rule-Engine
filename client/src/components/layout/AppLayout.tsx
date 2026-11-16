import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  activeAlertCount?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeAlertCount = 2 }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  return (
    <div className="flex h-screen bg-industrial-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar activeAlertCount={activeAlertCount} />
        
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
