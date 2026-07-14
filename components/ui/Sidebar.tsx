"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/staff", label: "ダッシュボード" },
  { href: "/staff/letters", label: "手紙一覧" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-52 shrink-0 border-r border-slate-200 bg-white sticky top-[72px] self-start h-[calc(100vh-72px)]">
      <nav className="py-4 px-3 space-y-1">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/staff" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? "bg-blue-50 text-blue-800 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
