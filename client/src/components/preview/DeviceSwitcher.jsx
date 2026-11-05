import React from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';

export default function DeviceSwitcher({ device, setDevice, onRefresh, publicUrl }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-slate-300 border-b border-slate-800 text-xs select-none">
      <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700/60">
        <button
          type="button"
          onClick={() => setDevice('desktop')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
            device === 'desktop' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
          title="Desktop view (100%)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => setDevice('tablet')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
            device === 'tablet' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
          title="Tablet view (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => setDevice('mobile')}
          className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
            device === 'mobile' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
          title="Mobile view (375px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
            title="Open in new window"
          >
            <span>Open Tab</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )}
      </div>
    </div>
  );
}

