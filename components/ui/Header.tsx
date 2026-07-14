"use client";

import Image from "next/image";
import Link from "next/link";
import { staffProfile } from "@/lib/seed";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="px-6 h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/broad-listening-logo.png"
            alt="Broad Listening"
            width={207}
            height={38}
            priority
          />
        </Link>

        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="hidden md:inline text-right">
            <span className="block text-slate-800">{staffProfile.name}</span>
            <span className="block text-xs text-slate-500 tabular-nums">
              {staffProfile.id}
            </span>
          </span>
          <Link
            href="/"
            className="border border-slate-300 rounded-lg px-4 h-9 inline-flex items-center text-sm text-slate-700 hover:bg-slate-50"
          >
            ログアウト
          </Link>
        </div>
      </div>
    </header>
  );
}
