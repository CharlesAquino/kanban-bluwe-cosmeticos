"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Shield } from "lucide-react";

const overviewTabs = [
  { href: "/home", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/hourly-control", label: "Hora a Hora" },
  { href: "/mod-analysis", label: "MOD" },
  { href: "/quality", label: "Qualidade" },
  { href: "/kanban-overview", label: "Produção" },
  { href: "/semi-finished-overview", label: "Kanban" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Esconde completamente o NavBar em qualquer rota admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <div className="relative">
      {/* Inline tabs on md+ */}
      <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm">
        {overviewTabs
          .filter((t) => !isActive(t.href))
          .map((t) => (
            <Link
              key={t.href}
              href={t.href}
              prefetch
              aria-current={isActive(t.href) ? "page" : undefined}
              className={`inline-flex items-center px-3 py-2 rounded-full font-medium border transition-colors ${
                isActive(t.href)
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        <Link
          href="/admin/login"
          prefetch
          className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-full font-semibold border border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 text-xs sm:text-sm"
        >
          <Shield className="h-4 w-4" />
          <span>Admin</span>
        </Link>
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
          {overviewTabs
            .filter((t) => !isActive(t.href))
            .map((t) => (
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
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 font-semibold text-sm bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        </div>
      )}
    </div>
  );
}
