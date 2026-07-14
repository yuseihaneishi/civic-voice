"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { staffProfile } from "@/lib/seed";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function LoginPage() {
  const reset = useStore((s) => s.resetData);
  const router = useRouter();
  const [userId, setUserId] = useState(staffProfile.id);
  const [password, setPassword] = useState("demo-password");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim() || submitting) return;
    setSubmitting(true);
    router.push("/staff");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Image
            src="/broad-listening-logo.png"
            alt="Broad Listening"
            width={207}
            height={38}
            priority
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  "デモデータを初期状態に戻します。振り分けや回答案の変更はリセットされます。",
                )
              ) {
                reset();
              }
            }}
          >
            デモデータをリセット
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              職員ログイン
            </h1>
            <p className="text-[15px] text-slate-600 mt-4 leading-relaxed">
              LINE等で寄せられた県民の声の要約・振り分け・
              <br />
              回答案作成を支援する職員向けシステムです。
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-slate-200 bg-white rounded-2xl shadow-sm px-10 py-10 space-y-7"
          >
            <div>
              <label
                htmlFor="login-id"
                className="block text-sm text-slate-700 mb-2 font-medium"
              >
                職員ID<span className="text-rose-700 ml-1">*</span>
              </label>
              <Input
                id="login-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
                placeholder="例：STF-2041"
                className="h-13 px-4 py-3.5 !text-base"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm text-slate-700 mb-2 font-medium"
              >
                パスワード<span className="text-rose-700 ml-1">*</span>
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="パスワードを入力"
                className="h-13 px-4 py-3.5 !text-base"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-13 !text-base"
              disabled={!userId.trim() || !password.trim() || submitting}
            >
              {submitting ? "ログイン中…" : "ログイン"}
            </Button>
            <p className="text-[13px] text-slate-400 leading-relaxed text-center">
              ※ デモ環境のため、入力済みのID・パスワードのままログインできます。
            </p>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4 text-xs text-slate-500">
          © Broad Listening — 「知事への手紙」支援システム / 共同検証用プロトタイプ
        </div>
      </footer>
    </div>
  );
}
