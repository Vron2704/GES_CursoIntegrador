import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastNotification } from '../common/ToastNotification';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen max-h-screen bg-slate-100/70 flex flex-col antialiased text-slate-800 overflow-hidden print:h-auto print:max-h-none print:overflow-visible print:bg-white">
      <Navbar />
      <div className="flex-1 flex flex-row w-full overflow-hidden min-h-0 print:h-auto print:overflow-visible">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full print:p-0 print:overflow-visible print:h-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <ToastNotification />
    </div>
  );
};
