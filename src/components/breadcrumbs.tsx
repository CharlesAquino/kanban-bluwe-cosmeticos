"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  const buildHref = (index: number) => "/" + segments.slice(0, index + 1).join("/");

  return (
    <nav aria-label="breadcrumbs" className="text-sm text-slate-600">
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link href="/home" className="hover:underline text-slate-700">Home</Link>
        </li>
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-slate-400">/</span>
            {i === segments.length - 1 ? (
              <span className="font-medium text-slate-800 capitalize">{decodeURIComponent(seg.replace(/-/g, " "))}</span>
            ) : (
              <Link
                href={buildHref(i)}
                className="hover:underline capitalize"
              >
                {decodeURIComponent(seg.replace(/-/g, " "))}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
