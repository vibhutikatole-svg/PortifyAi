import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-[#176B67]/10 text-[#176B67] border-[#176B67]/20',
    teal: 'bg-[#176B67]/10 text-[#176B67] border-[#176B67]/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-[#252B2A] text-white border-[#252B2A]',
    subtle: 'bg-[#176B67]/10 text-[#176B67] border-[#176B67]/20',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

