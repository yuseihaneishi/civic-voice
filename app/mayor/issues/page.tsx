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
} from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { useStore } from "@/lib/store";
import { priorityLabel, priorityScore } from "@/lib/utils";

export default function MayorIssuesPage() {
  const issues = useStore((s) => s.issues);
  const sorted = useMemo(
    () =>
      [...issues].sort(
        (a, b) =>
          priorityScore(b.urgency, b.importance) -
          priorityScore(a.urgency, a.importance),
      ),
    [issues],
  );

  return (
    <PageContainer>
      <PageTitle
        title="重要課題ランキング"
        description="市政上の判断が必要な課題を、優先度・件数・トレンドで確認できます。"
      />

      <Card padded={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-200">
              <th className="text-left py-2.5 px-4 font-normal">順位</th>
              <th className="text-left py-2.5 px-2 font-normal">課題</th>
              <th className="text-left py-2.5 px-2 font-normal">関連部署</th>
              <th className="text-right py-2.5 px-2 font-normal">件数</th>
              <th className="text-left py-2.5 px-2 font-normal">推移</th>
              <th className="text-left py-2.5 px-2 font-normal">優先度</th>
              <th className="text-left py-2.5 px-2 font-normal">状態</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((iss, i) => {
              const score = priorityScore(iss.urgency, iss.importance);
              const label = priorityLabel(score);
              return (
                <tr
                  key={iss.id}
                  className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50"
                >
                  <td className="py-3 px-4 text-slate-800 tabular-nums">
                    {i + 1}
                  </td>
                  <td className="py-3 px-2 text-slate-800 max-w-[420px]">
                    <Link
                      href={`/staff/issues/${iss.id}`}
                      className="hover:underline font-medium leading-snug"
                    >
                      {iss.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {iss.description}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                      {iss.departments.map((d) => (
                        <Badge tone="outline" key={d}>
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </td>
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
                    <PriorityBadge label={label} />
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
