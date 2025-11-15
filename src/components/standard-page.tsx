"use client";
import React from "react";

export function StandardPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="rounded-3xl p-8 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm">
        {children}
      </div>
    </main>
  );
}
