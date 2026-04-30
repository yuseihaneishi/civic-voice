"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Badge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import {
  Card,
  PageContainer,
  PageTitle,
} from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Sparkline } from "@/components/ui/Sparkline";
import { useStore } from "@/lib/store";
import { priorityLabel, priorityScore } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { categories } from "@/lib/seed";

export default function StaffIssuesPage() {
  const issues = useStore((s) => s.issues);
  const [category, setCategory] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<"priority" | "count" | "trend">("priority");

  const filtered = useMemo(() => {
    let list = [...issues];
    if (category !== "all") list = list.filter((i) => i.category === category);
    if (sort === "priority") {
      list.sort(
        (a, b) =>
          priorityScore(b.urgency, b.importance) -
          priorityScore(a.urgency, a.importance),
      );
    } else if (sort === "count") {
      list.sort((a, b) => b.inquiryCount - a.inquiryCount);
    } else {
      const trendRank: Record<string, number> = {
        急増: 0,
        増加: 1,
        横ばい: 2,
        減少: 3,
      };
      list.sort((a, b) => trendRank[a.trend] - trendRank[b.trend]);
    }
    return list;
  }, [issues, category, sort]);

  return (
    <PageContainer>
      <PageTitle
        title="課題リスト"
        description="複数の問い合わせから抽出された、市政・現場業務上の課題です。所管部署・トレンド・優先度で並べ替えできます。"
      />

      <Card padded={false}>
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-2">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as "all" | Category)}
            className="text-sm h-9 w-44"
          >
            <option value="all">すべての分野</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "priority" | "count" | "trend")
            }
            className="text-sm h-9 w-44"
          >
            <option value="priority">優先度順</option>
            <option value="count">件数順</option>
            <option value="trend">トレンド順</option>
          </Select>
          <span className="ml-auto text-xs text-slate-500">
            {filtered.length} 件
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 font-normal">課題</th>
              <th className="text-left py-2.5 px-2 font-normal">関連部署</th>
              <th className="text-left py-2.5 px-2 font-normal">分野</th>
              <th className="text-right py-2.5 px-2 font-normal">件数</th>
              <th className="text-left py-2.5 px-2 font-normal">トレンド</th>
              <th className="text-left py-2.5 px-2 font-normal">優先度</th>
              <th className="text-left py-2.5 px-2 font-normal">状態</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((iss) => {
              const score = priorityScore(iss.urgency, iss.importance);
              const label = priorityLabel(score);
              return (
                <tr
                  key={iss.id}
                  className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50"
                >
                  <td className="py-3 px-4 text-slate-800 max-w-[420px]">
                    <Link
                      href={`/staff/issues/${iss.id}`}
                      className="hover:underline leading-snug"
                    >
                      {iss.title}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-slate-700">
                    <div className="flex flex-wrap gap-1">
                      {iss.departments.map((d) => (
                        <Badge tone="outline" key={d}>
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-700">{iss.category}</td>
                  <td className="py-3 px-2 text-slate-800 text-right tabular-nums">
                    {iss.inquiryCount}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <Sparkline
                        values={iss.weeklySeries}
                        width={120}
                        height={28}
                      />
                      <Badge
                        tone={
                          iss.trend === "急増"
                            ? "alert"
                            : iss.trend === "増加"
                              ? "warn"
                              : "muted"
                        }
                      >
                        {iss.trend}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <PriorityBadge label={label} />
                      <span className="text-xs text-slate-500 tabular-nums">
                        {score}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={iss.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </PageContainer>
  );
}
