import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#176B67] hover:bg-[#135653] text-white shadow-subtle focus:ring-[#176B67]',
    secondary: 'bg-[#252B2A] hover:bg-[#1b1f1e] text-white shadow-subtle focus:ring-[#252B2A]',
    outline: 'border border-[#E6E2D8] hover:border-[#252B2A]/30 bg-white hover:bg-[#F7F5EF] text-[#252B2A] focus:ring-[#176B67]',
    ghost: 'hover:bg-[#EAE6DC]/60 text-[#252B2A] hover:text-[#176B67] focus:ring-[#176B67]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-subtle focus:ring-rose-500',
    subtle: 'bg-[#176B67]/10 hover:bg-[#176B67]/20 text-[#176B67] font-semibold focus:ring-[#176B67]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

