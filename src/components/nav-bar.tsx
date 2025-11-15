"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quality", label: "Qualidade" },
  { href: "/hourly-control", label: "Controle Hora a Hora" },
  { href: "/semi-finished", label: "Semi-Acabados" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <div className="relative">
      {/* Inline tabs on md+ */}
      <nav className="hidden md:flex items-center gap-2 text-sm">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            prefetch
            className={`px-3 py-2 rounded-xl font-medium border transition-colors ${
              isActive(t.href)
                ? "bg-blue-800 text-white border-blue-800"
                : "bg-white/70 backdrop-blur-xl border-slate-200 text-slate-700 hover:bg-white/80"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Hamburger on mobile */}
      <button
        className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white/70 text-slate-700"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" /> Menu
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-md p-2 md:hidden">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              onClick={() => setOpen(false)}
              className={`block w-full text-left px-3 py-2 rounded-lg font-medium text-sm mb-1 last:mb-0 ${
                isActive(t.href)
                  ? "bg-blue-800 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
