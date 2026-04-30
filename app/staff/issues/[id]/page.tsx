"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
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
import { CommentThread } from "@/components/ui/CommentThread";
import { DecisionPanel } from "@/components/ui/DecisionPanel";
import { BarChart } from "@/components/ui/Sparkline";
import { useHydrated } from "@/lib/hooks";
import { roleProfiles, weeklySeriesLabels } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { priorityLabel, priorityScore } from "@/lib/utils";

export default function IssueDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const hydrated = useHydrated();
  const issues = useStore((s) => s.issues);
  const allInquiries = useStore((s) => s.inquiries);
  const addComment = useStore((s) => s.addIssueComment);
  const deleteComment = useStore((s) => s.deleteIssueComment);
  const issue = issues.find((i) => i.id === id);

  if (!hydrated) {
    return (
      <PageContainer>
        <div className="h-6 w-40 bg-slate-100 animate-pulse" />
      </PageContainer>
    );
  }

  if (!issue) notFound();

  const score = priorityScore(issue.urgency, issue.importance);
  const label = priorityLabel(score);
  const related = allInquiries.filter((i) =>
    i.relatedIssueIds.includes(issue.id),
  );
  const staffProfile = roleProfiles.staff;

  return (
    <PageContainer>
      <div className="mb-4 text-xs">
        <Link href="/staff/issues" className="text-slate-600 hover:underline">
          ← 課題リストへ戻る
        </Link>
      </div>
      <PageTitle
        title={issue.title}
        description={`${issue.category} ／ 関連部署：${issue.departments.join("・")}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="関連件数" value={issue.inquiryCount} hint="累計" />
        <Stat label="優先度" value={`${label}（${score}）`} />
        <Stat label="トレンド" value={issue.trend} />
        <Stat label="振り分け" value={issue.triage} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="課題の概要">
            <p className="text-sm text-slate-800 leading-relaxed">
              {issue.description}
            </p>
          </Card>

          <Card
            title="提案される対応"
            description="関連する問い合わせ群から導出された改善案"
          >
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {issue.proposal}
            </p>
          </Card>

          <Card title="件数の推移（週次）">
            <BarChart
              values={issue.weeklySeries}
              labels={weeklySeriesLabels}
              highlightLast
            />
          </Card>

          <CommentThread
            title="ディスカッション"
            description="関係部署・幹部間で、判断や対応について議論できます。"
            comments={issue.comments ?? []}
            currentRole="staff"
            currentName={staffProfile.defaultName}
            onAdd={(body) =>
              addComment(issue.id, body, {
                role: "staff",
                name: staffProfile.defaultName,
              })
            }
            onDelete={(cid) => deleteComment(issue.id, cid)}
          />

          <Card
            title="紐づく問い合わせ"
            description={`関連する個別の市民の声 ${related.length} 件`}
            padded={false}
          >
            <ul className="divide-y divide-slate-100">
              {related.map((i) => (
                <li
                  key={i.id}
                  className="p-4 flex items-start gap-3 hover:bg-slate-50/60"
                >
                  <div className="text-xs text-slate-500 tabular-nums shrink-0 w-32">
                    {i.receivedAt}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/staff/inquiries/${i.id}`}
                      className="text-sm text-slate-800 hover:underline leading-snug"
                    >
                      {i.summary}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <Badge tone="muted">{i.channel}</Badge>
                      <Badge tone="outline">{i.department}</Badge>
                      <span className="text-slate-500">{i.citizenName}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <PriorityBadge
                      label={priorityLabel(
                        priorityScore(i.urgency, i.importance),
                      )}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <DecisionPanel issue={issue} />

          {issue.decisionLog.length > 0 && (
            <Card title="判断履歴">
              <ol className="text-xs text-slate-700 space-y-3">
                {[...issue.decisionLog].reverse().map((d, i) => (
                  <li key={i} className="border-l-2 border-slate-200 pl-3">
                    <div className="text-slate-500 tabular-nums">{d.at}</div>
                    <div className="mt-0.5">
                      <StatusBadge status={d.status} />
                    </div>
                    {d.note && (
                      <p className="mt-1 text-slate-600 leading-relaxed">
                        {d.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          <Card title="代表的な市民の声">
            <ul className="space-y-3 text-sm">
              {issue.citizenVoices.map((v, idx) => (
                <li
                  key={idx}
                  className="border-l-2 border-slate-300 pl-3 text-slate-700 leading-relaxed"
                >
                  「{v}」
                </li>
              ))}
            </ul>
          </Card>

          {issue.relatedIssueIds.length > 0 && (
            <Card title="関連する他の課題">
              <ul className="space-y-3">
                {issue.relatedIssueIds.map((rid) => {
                  const r = issues.find((x) => x.id === rid);
                  if (!r) return null;
                  return (
                    <li key={rid}>
                      <Link
                        href={`/staff/issues/${rid}`}
                        className="text-sm text-slate-800 hover:underline leading-snug"
                      >
                        {r.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r.departments.join("・")} ／ {r.inquiryCount} 件
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
