"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Badge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import {
  Card,
  PageContainer,
  PageTitle,
  Stat,
} from "@/components/ui/Card";
import { BarChart, Sparkline } from "@/components/ui/Sparkline";
import { useHydrated } from "@/lib/hooks";
import { weeklySeriesLabels } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { priorityLabel, priorityScore } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  税: "#0f172a",
  "道路・交通": "#475569",
  "子育て・教育": "#64748b",
  福祉: "#94a3b8",
  暮らし: "#cbd5e1",
  環境: "#1e3a5f",
  "イベント・観光": "#3b5b81",
  行政手続: "#7d8fa3",
  その他: "#e2e8f0",
};

export default function MayorDashboard() {
  const hydrated = useHydrated();
  const inquiries = useStore((s) => s.inquiries);
  const issues = useStore((s) => s.issues);

  const triageMayor = issues.filter(
    (i) => i.triage === "市政反映" && i.status !== "対応完了",
  );
  const escalated = issues.filter((i) => i.status === "上申済");

  const totalSeries = useMemo(
    () =>
      weeklySeriesLabels.map((_, i) =>
        issues.reduce((sum, iss) => sum + (iss.weeklySeries[i] ?? 0), 0),
      ),
    [issues],
  );

  const topIssues = useMemo(
    () =>
      [...issues]
        .sort(
          (a, b) =>
            priorityScore(b.urgency, b.importance) -
            priorityScore(a.urgency, a.importance),
        )
        .slice(0, 5),
    [issues],
  );

  const categoryEntries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const iss of issues) {
      counts[iss.category] = (counts[iss.category] ?? 0) + iss.inquiryCount;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  return (
    <PageContainer>
      <PageTitle
        title="市政運営ダッシュボード"
        description="市民の声から抽出された主要課題と、市政反映候補のサマリーです。"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat
          label="今月の市民の声"
          value={hydrated ? inquiries.length : 0}
          hint="累計件数"
        />
        <Stat
          label="市政反映候補"
          value={hydrated ? triageMayor.length : 0}
          hint="未上申を含む"
        />
        <Stat
          label="上申済み"
          value={hydrated ? escalated.length : 0}
          hint="検討中の議題"
        />
        <Stat
          label="例外検知"
          value={hydrated ? inquiries.filter((i) => i.isException).length : 0}
          hint="部署横断・要判断"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card
            title="市民の声の総量推移（週次）"
            description="経路を問わず、受付件数の推移です。直近で住民税・部署横断課題が増加しています。"
          >
            <BarChart
              values={totalSeries}
              labels={weeklySeriesLabels}
              highlightLast
            />
          </Card>
        </div>
        <Card
          title="分野別の構成"
          description="件数が多い分野から表示しています。"
        >
          <ul className="space-y-2.5">
            {categoryEntries.map(([cat, count]) => {
              const max = categoryEntries[0][1];
              const pct = Math.round((count / max) * 100);
              return (
                <li key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-500 tabular-nums">
                      {count} 件
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100">
                    <div
                      className="h-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          categoryColors[cat] ?? "#475569",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2">
          <Card
            title="重要課題ランキング"
            description="緊急度 × 重要度 が高く、市政判断が必要な順に表示しています。"
            action={
              <Link
                href="/mayor/issues"
                className="text-xs text-slate-700 underline"
              >
                すべての課題を見る
              </Link>
            }
            padded={false}
          >
            <ol className="divide-y divide-slate-100">
              {topIssues.map((iss, i) => {
                const score = priorityScore(iss.urgency, iss.importance);
                const label = priorityLabel(score);
                return (
                  <li key={iss.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/60">
                    <span className="w-7 h-7 inline-flex items-center justify-center bg-slate-100 text-slate-700 text-sm font-semibold tabular-nums shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/staff/issues/${iss.id}`}
                        className="text-sm font-semibold text-slate-900 hover:underline leading-snug"
                      >
                        {iss.title}
                      </Link>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {iss.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge tone="info">{iss.category}</Badge>
                        {iss.departments.map((d) => (
                          <Badge tone="outline" key={d}>
                            {d}
                          </Badge>
                        ))}
                        <Badge
                          tone={iss.triage === "市政反映" ? "info" : "neutral"}
                        >
                          {iss.triage}
                        </Badge>
                        <StatusBadge status={iss.status} />
                        <span className="text-slate-500 tabular-nums">
                          関連 {iss.inquiryCount} 件
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <PriorityBadge
                        label={label}
                        className="!w-8 !h-8 !text-sm"
                      />
                      <Sparkline
                        values={iss.weeklySeries}
                        width={120}
                        height={28}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
        <div className="space-y-5">
          <Card
            title="市政反映の上申候補"
            description="市長判断が必要な案件のサマリー"
            action={
              <Link
                href="/mayor/proposals"
                className="text-xs text-slate-700 underline"
              >
                改善提案を見る
              </Link>
            }
            padded={false}
          >
            <ul className="divide-y divide-slate-100">
              {triageMayor.map((iss) => (
                <li key={iss.id} className="p-4">
                  <Link
                    href={`/staff/issues/${iss.id}`}
                    className="text-sm text-slate-800 hover:underline leading-snug"
                  >
                    {iss.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">
                    {iss.departments.join("・")} ／ {iss.inquiryCount} 件 ／{" "}
                    {iss.trend}
                  </p>
                </li>
              ))}
              {triageMayor.length === 0 && (
                <li className="p-4 text-xs text-slate-500">
                  上申候補はありません
                </li>
              )}
            </ul>
          </Card>

          <Card title="例外として検知された相談">
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              件数は少ないが、構造的な問題を示唆する相談です。
            </p>
            <ul className="space-y-3">
              {inquiries
                .filter((i) => i.isException)
                .map((i) => (
                  <li
                    key={i.id}
                    className="border-l-2 border-amber-400 pl-3"
                  >
                    <Link
                      href={`/staff/inquiries/${i.id}`}
                      className="text-sm text-slate-800 hover:underline leading-snug"
                    >
                      {i.summary}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {i.department} ／ {i.citizenName}
                    </p>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
