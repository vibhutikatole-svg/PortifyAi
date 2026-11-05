import React from 'react';

export function Skeleton({ className = '', width, height, rounded = 'rounded-xl' }) {
  const style = {
    width,
    height,
  };

  return (
    <div
      style={style}
      className={`bg-slate-200/70 animate-pulse ${rounded} ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.75rem"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-6 bg-white border border-slate-200 rounded-2xl shadow-subtle space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton width="80px" height="20px" rounded="rounded-md" />
        <Skeleton width="50px" height="16px" rounded="rounded-md" />
      </div>
      <Skeleton width="70%" height="24px" />
      <Skeleton width="45%" height="16px" />
      <Skeleton height="40px" />
      <div className="flex gap-2 pt-2">
        <Skeleton width="100%" height="32px" />
        <Skeleton width="36px" height="32px" />
      </div>
    </div>
  );
}

