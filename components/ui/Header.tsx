"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleProfiles } from "@/lib/seed";
import type { Role } from "@/lib/types";

type HeaderProps = {
  role: Role;
  userName: string;
  userId: string;
};

const navByRole: Record<Role, { href: string; label: string }[]> = {
  citizen: [
    { href: "/citizen", label: "ご意見・ご要望を投稿" },
    { href: "/citizen/history", label: "過去のお問い合わせ" },
  ],
  staff: [
    { href: "/staff", label: "問い合わせ一覧" },
    { href: "/staff/issues", label: "課題リスト" },
    { href: "/staff/proposals", label: "改善提案" },
  ],
  mayor: [
    { href: "/mayor", label: "全体ダッシュボード" },
    { href: "/mayor/issues", label: "重要課題ランキング" },
    { href: "/mayor/proposals", label: "改善提案" },
  ],
};

const roleAbbr: Record<Role, string> = {
  citizen: "市民",
  staff: "職員",
  mayor: "幹部",
};

export function Header({ role, userName, userId }: HeaderProps) {
  const profile = roleProfiles[role];
  const nav = navByRole[role];
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="inline-block w-1.5 h-6 bg-slate-900 group-hover:bg-slate-700 transition-colors" aria-hidden />
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              市民の声プラットフォーム
            </span>
          </Link>
          <span className="hidden md:inline-flex items-center gap-2 text-[11px] text-slate-500">
            <span className="border border-slate-300 px-1.5 py-0.5">
              {roleAbbr[role]}
            </span>
            {profile.label}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-sm flex-1 justify-center">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/citizen" &&
                item.href !== "/staff" &&
                item.href !== "/mayor" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 h-14 inline-flex items-center border-b-2 -mb-px transition-colors ${
                  active
                    ? "border-slate-900 text-slate-900 font-medium"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="hidden md:inline text-right">
            <span className="block text-slate-800">{userName}</span>
            <span className="block text-slate-500 tabular-nums">{userId}</span>
          </span>
          <Link
            href="/"
            className="border border-slate-300 px-3 h-8 inline-flex items-center text-slate-700 hover:bg-slate-50"
          >
            ログアウト
          </Link>
        </div>
      </div>
    </header>
  );
}
