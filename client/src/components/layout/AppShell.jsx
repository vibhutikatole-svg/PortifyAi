import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import ErrorBoundary from '../common/ErrorBoundary';

export default function AppShell({ children, showFooter = true, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className={`flex-1 ${fullWidth ? 'w-full' : ''}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

