"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/lib/hooks";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/staff", label: "ダッシュボード" },
  { href: "/staff/letters", label: "手紙一覧" },
  { href: "/staff/approvals", label: "決裁" },
];

export function Sidebar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const pendingCount = useStore(
    (s) => s.letters.filter((l) => l.status === "決裁待ち").length,
  );

  return (
    <aside className="hidden md:block w-52 shrink-0 border-r border-slate-200 bg-white sticky top-[72px] self-start h-[calc(100vh-72px)]">
      <nav className="py-4 px-3 space-y-1">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/staff" && pathname.startsWith(item.href));
          const showBadge =
            item.href === "/staff/approvals" && hydrated && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? "bg-blue-50 text-blue-800 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{item.label}</span>
              {showBadge && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[11px] font-semibold tabular-nums">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
