import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div role="status" className={`inline-flex items-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-600 ${sizeMap[size] || sizeMap.md}`} />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

