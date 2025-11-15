"use client";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
}

export function Carousel({ children, className = "" }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className={`relative rounded-2xl border border-slate-200 bg-white/80 w-full max-w-full overflow-hidden ${className}`}>
      <div
        ref={ref}
        className="overflow-x-auto no-scrollbar w-full max-w-full"
      >
        <div className="flex gap-3 py-3 snap-x snap-mandatory justify-center w-full">
          {React.Children.map(children, (child, idx) => (
            <div key={idx} className="carousel-item shrink-0 snap-center rounded-xl overflow-hidden">
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollBy(-280)}
        className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center h-8 w-8 rounded-full shadow bg-white/90 border border-slate-200 text-slate-700 hover:bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scrollBy(280)}
        className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center justify-center h-8 w-8 rounded-full shadow bg-white/90 border border-slate-200 text-slate-700 hover:bg-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
