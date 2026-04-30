"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { roleProfiles } from "@/lib/seed";
import type { RoleProfile } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const reset = useStore((s) => s.resetData);
  const roles = [
    roleProfiles.citizen,
    roleProfiles.staff,
    roleProfiles.mayor,
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-6 bg-slate-900" aria-hidden />
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              市民の声プラットフォーム
            </span>
            <span className="hidden md:inline text-[11px] text-slate-500 ml-2">
              共同検証用プロトタイプ
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  "デモデータを初期状態に戻します。投稿した内容や対応状況の変更はリセットされます。",
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

      <main className="flex-1 max-w-screen-xl mx-auto px-6 py-12 w-full">
        <div className="mb-10">
          <p className="text-xs text-slate-500 mb-1.5 tracking-wide">
            ログイン
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            ご利用になる立場をお選びください
          </h1>
          <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
            本プラットフォームは、市民からの電話・メール・窓口でのお声を
            横断的に整理し、市政・現場業務の改善につなげるための内向け基盤です。
            お立場により表示される画面が異なります。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <RoleCard key={r.role} role={r} />
          ))}
        </div>

        <section className="mt-12 border border-slate-200 bg-white">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              本プラットフォームの仕組み
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              インターフェース層・データ蓄積層・分析提言層の3層構成
            </p>
          </div>
          <div className="grid md:grid-cols-3 divide-x divide-slate-200">
            <Layer
              num="1"
              title="インターフェース層"
              body="メール・電話・窓口・Web経由の市民の声を一箇所に受け付け、テキスト化・要点化までを行います。"
            />
            <Layer
              num="2"
              title="データ蓄積層"
              body="時系列性を持った構造化データベースとして蓄積。部署横断で関連するご意見の関係性を保持します。"
            />
            <Layer
              num="3"
              title="分析・提言層"
              body="課題抽出と市政／現場の振り分けを段階的に精度向上させ、職員のフィードバックで継続学習します。"
            />
          </div>
        </section>

        <section className="mt-8 border border-slate-200 bg-white">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              デモの動かし方
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              下記の流れでロール間をまたいだ体験ができます。
            </p>
          </div>
          <ol className="grid md:grid-cols-3 divide-x divide-slate-200">
            <Step
              num="1"
              title="市民として投稿"
              body="ご意見・ご要望フォームから新しい問い合わせを送信します。所管部署と優先度が自動で振り分けられます。"
            />
            <Step
              num="2"
              title="職員として確認"
              body="問い合わせ一覧で、市民の投稿が新着として表示されます。所管・優先度・状況を変更できます。"
            />
            <Step
              num="3"
              title="市長として判断"
              body="改善提案ページで、上申・着手のアクションを行うと、ダッシュボードのステータスが連動します。"
            />
          </ol>
        </section>

        <p className="mt-8 text-xs text-slate-500">
          ※ 本画面はデモ用です。各ロールのログインボタンを押すとサンプル利用者で各画面に遷移します。
        </p>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4 text-xs text-slate-500">
          © 市民の声プラットフォーム / 共同検証用プロトタイプ
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ role }: { role: RoleProfile }) {
  const abbr =
    role.role === "citizen" ? "市民" : role.role === "staff" ? "職員" : "幹部";
  return (
    <div className="border border-slate-200 bg-white flex flex-col group hover:border-slate-400 transition-colors">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-9 h-9 border border-slate-300 text-xs font-semibold text-slate-700 group-hover:border-slate-900 transition-colors">
          {abbr}
        </span>
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          {role.label}
        </h3>
      </div>
      <div className="px-5 py-4 flex-1">
        <p className="text-sm text-slate-700 leading-relaxed">
          {role.description}
        </p>
        <ul className="mt-4 space-y-1.5">
          {role.bullets.map((b) => (
            <li
              key={b}
              className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed"
            >
              <span className="text-slate-400 shrink-0 mt-0.5">・</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <div className="flex">
            <dt className="w-20">ID</dt>
            <dd className="text-slate-700 tabular-nums">{role.defaultId}</dd>
          </div>
          <div className="flex">
            <dt className="w-20">利用者</dt>
            <dd className="text-slate-700">{role.defaultName}</dd>
          </div>
        </dl>
      </div>
      <div className="px-5 py-4 border-t border-slate-200">
        <Link
          href={role.href}
          className="block w-full text-center bg-slate-900 text-white py-2.5 text-sm hover:bg-slate-800 transition-colors"
        >
          {role.signInLabel}
        </Link>
      </div>
    </div>
  );
}

function Layer({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="p-6">
      <p className="text-xs text-slate-500 tabular-nums">層 {num}</p>
      <h3 className="mt-1 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="p-6">
      <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-900 text-white text-xs font-semibold tabular-nums">
        {num}
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
