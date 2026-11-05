import React from 'react';

export default function Container({
  children,
  size = 'xl',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const sizeMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-[1600px]',
    full: 'max-w-full',
  };

  return (
    <Component
      className={`w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 ${sizeMap[size] || sizeMap.xl} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

