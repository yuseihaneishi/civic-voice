"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, PageContainer, PageTitle, Stat } from "@/components/ui/Card";
import { BarChart, Donut } from "@/components/ui/Sparkline";
import { useHydrated } from "@/lib/hooks";
import {
  channelBreakdown,
  departmentStats,
  monthlySeries,
  seedThemes,
} from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const hydrated = useHydrated();
  const letters = useStore((s) => s.letters);

  const fresh = letters.filter((l) => l.status === "新着").length;
  const drafting = letters.filter((l) => l.status === "回答案作成中").length;
  const waiting = letters.filter((l) => l.status === "決裁待ち").length;
  const lineCount = channelBreakdown[0].value;
  const monthTotal = monthlySeries.values[monthlySeries.values.length - 1];
  const lineRatio = Math.round((lineCount / monthTotal) * 100);

  return (
    <PageContainer>
      <PageTitle
        title="全体ダッシュボード"
        description="「知事への手紙」に寄せられた県民の声の受付状況・頻出テーマ・部局別の対応状況を一覧できます。（2026年7月）"
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Stat
          label="今月の受付件数"
          value={monthTotal}
          trend={{ dir: "up", text: "前月比 +15件" }}
        />
        <Stat label="LINE経由の割合" value={`${lineRatio}%`} hint="前年同月 41%" />
        <Stat
          label="未対応（新着）"
          value={hydrated ? fresh : 0}
          hint="AI振り分けの確認待ち"
        />
        <Stat
          label="決裁待ち"
          value={hydrated ? waiting : 0}
          hint={hydrated && drafting > 0 ? `回答案作成中 ${drafting} 件` : undefined}
        />
        <Stat
          label="平均回答日数"
          value="4.2日"
          trend={{ dir: "down", text: "AI導入前 12.6日" }}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card
          title="月別受付件数"
          description="直近12ヶ月。LINE窓口の開設以降、受付件数が増加しています。"
        >
          <BarChart
            values={monthlySeries.values}
            labels={monthlySeries.labels}
            highlightLast
          />
        </Card>
        <Card
          title="受付チャネル内訳（今月）"
          description="LINEが最多。従来は郵送・メール中心でした。"
        >
          <Donut segments={channelBreakdown} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card
          title="頻出テーマランキング（直近30日）"
          description="AIが内容の近い手紙をテーマごとに自動でまとめています。"
          className="lg:col-span-3"
          padded={false}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="text-left py-2.5 px-4 font-normal w-8">#</th>
                <th className="text-left py-2.5 px-2 font-normal">テーマ</th>
                <th className="text-left py-2.5 px-2 font-normal">分野</th>
                <th className="text-right py-2.5 px-2 font-normal">件数</th>
                <th className="text-left py-2.5 px-4 font-normal">傾向</th>
              </tr>
            </thead>
            <tbody>
              {seedThemes.map((t, idx) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-0 align-middle hover:bg-slate-50"
                >
                  <td className="py-2.5 px-4 text-xs text-slate-500 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-2">
                    <p className="text-slate-800 leading-snug">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      「{t.sample}」
                    </p>
                  </td>
                  <td className="py-2.5 px-2 text-xs text-slate-600 whitespace-nowrap">
                    {t.category}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-800">
                    {t.count}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge
                      tone={
                        t.trend === "急増"
                          ? "alert"
                          : t.trend === "増加"
                            ? "warn"
                            : "muted"
                      }
                    >
                      {t.trend}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title="部局別の対応状況（今月）"
          description="所管への振り分け結果と回答の進み具合です。"
          className="lg:col-span-2"
          padded={false}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="text-left py-2.5 px-4 font-normal">部局</th>
                <th className="text-right py-2.5 px-2 font-normal">受付</th>
                <th className="text-right py-2.5 px-2 font-normal">未回答</th>
                <th className="text-right py-2.5 px-4 font-normal">
                  平均回答日数
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((d) => (
                <tr
                  key={d.department}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="py-2.5 px-4 text-slate-800 whitespace-nowrap">
                    {d.department}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums text-slate-700">
                    {d.received}
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">
                    <span
                      className={
                        d.unanswered >= 5 ? "text-rose-700" : "text-slate-700"
                      }
                    >
                      {d.unanswered}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-slate-700">
                    {d.avgDays.toFixed(1)}日
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-200 text-right">
            <Link
              href="/staff/letters"
              className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
            >
              手紙一覧を開く →
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
