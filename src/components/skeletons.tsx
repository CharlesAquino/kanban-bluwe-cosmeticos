"use client";
import React from "react";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl border border-slate-200 bg-slate-100 ${className}`}>
      <div className="h-24 sm:h-28 md:h-32" />
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-md border border-slate-200 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`h-10 ${i % 2 === 0 ? 'bg-slate-100' : 'bg-slate-50'}`} />
      ))}
    </div>
  );
}
