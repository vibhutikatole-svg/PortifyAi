import React from 'react';
import MinimalProTheme from './MinimalProTheme';
import DarkDeveloperTheme from './DarkDeveloperTheme';
import CreativeGradientTheme from './CreativeGradientTheme';
import CorporateEliteTheme from './CorporateEliteTheme';
import ModernGlassTheme from './ModernGlassTheme';

export const THEMES = [
  {
    id: 'minimal-pro',
    name: 'Minimal Pro',
    badge: 'Editorial Serif',
    description: 'Clean serif typography, generous whitespace, monochrome accents and sticky top navigation.',
    previewBg: 'bg-white border-slate-200',
    accentColor: '#0f172a',
    palette: ['#0f172a', '#ffffff', '#e2e8f0'],
  },
  {
    id: 'dark-developer',
    name: 'Dark Developer',
    badge: 'Console & Git',
    description: 'Terminal console header, interactive bash tabs, git branch career timeline, and syntax badges.',
    previewBg: 'bg-[#090D16] border-slate-800 text-white',
    accentColor: '#10b981',
    palette: ['#090D16', '#10b981', '#6366f1'],
  },
  {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    badge: 'Pastel Showcase',
    description: 'Soft pastel mesh gradients, floating frosted pill navbar, hover card lifts, and creative tag chips.',
    previewBg: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-200',
    accentColor: '#8b5cf6',
    palette: ['#8b5cf6', '#ec4899', '#ffffff'],
  },
  {
    id: 'corporate-elite',
    name: 'Corporate Elite',
    badge: 'Executive 2-Col',
    description: 'Authoritative two-column split layout, navy executive banner, leadership initiatives, and board credentials.',
    previewBg: 'bg-slate-900 border-indigo-700 text-white',
    accentColor: '#4338ca',
    palette: ['#0f172a', '#4338ca', '#f1f5f9'],
  },
  {
    id: 'modern-glass',
    name: 'Modern Glass',
    badge: 'Glassmorphism',
    description: 'Translucent frosted glass cards, subtle ambient glows, floating glass navbar, and cyan accents.',
    previewBg: 'bg-slate-950 border-white/20 text-white',
    accentColor: '#38bdf8',
    palette: ['#030712', '#38bdf8', '#818cf8'],
  },
];

export default function ThemeRenderer({ portfolio, qrCodeUrl }) {
  if (!portfolio) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-sm">
        No portfolio data available.
      </div>
    );
  }

  const theme = portfolio.theme || 'minimal-pro';

  switch (theme) {
    case 'dark-developer':
      return <DarkDeveloperTheme portfolio={portfolio} qrCodeUrl={qrCodeUrl} />;
    case 'creative-gradient':
      return <CreativeGradientTheme portfolio={portfolio} qrCodeUrl={qrCodeUrl} />;
    case 'corporate-elite':
      return <CorporateEliteTheme portfolio={portfolio} qrCodeUrl={qrCodeUrl} />;
    case 'modern-glass':
      return <ModernGlassTheme portfolio={portfolio} qrCodeUrl={qrCodeUrl} />;
    case 'minimal-pro':
    default:
      return <MinimalProTheme portfolio={portfolio} qrCodeUrl={qrCodeUrl} />;
  }
}
