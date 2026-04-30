"use client";

import Link from "next/link";
import { Badge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, Section, Stat } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { useStore } from "@/lib/store";
import type { Issue } from "@/lib/types";
import { priorityLabel, priorityScore } from "@/lib/utils";

export function ProposalSummary() {
  const issues = useStore((s) => s.issues);
  const policy = issues.filter((i) => i.triage === "市政反映").length;
  const field = issues.filter((i) => i.triage === "現場対応").length;
  const escalated = issues.filter((i) => i.status === "上申済").length;
  const completed = issues.filter((i) => i.status === "対応完了").length;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Stat label="提案総数" value={issues.length} />
      <Stat label="市政反映候補" value={policy} hint="上申検討対象" />
      <Stat label="現場対応案" value={field} hint="所管部署で実行可能" />
      <Stat
        label="進行中"
        value={escalated + issues.filter((i) => i.status === "対応着手").length}
        hint={completed > 0 ? `完了 ${completed} 件` : "上申済 + 着手済"}
      />
    </div>
  );
}

export function ProposalSections() {
  const issues = useStore((s) => s.issues);
  const sorted = [...issues].sort(
    (a, b) =>
      priorityScore(b.urgency, b.importance) -
      priorityScore(a.urgency, a.importance),
  );
  const policy = sorted.filter((i) => i.triage === "市政反映");
  const field = sorted.filter((i) => i.triage === "現場対応");
  return (
    <div className="space-y-8">
      <Section
        title="市政反映が必要な改善提案"
        description="単一部署では判断・実行が難しく、市政としての方針判断が必要な提案です。"
      >
        {policy.length === 0 ? (
          <EmptyState title="該当する提案はありません" />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {policy.map((iss) => (
              <ProposalCard key={iss.id} iss={iss} variant="policy" />
            ))}
          </div>
        )}
      </Section>
      <Section
        title="現場対応で進められる改善提案"
        description="所管部署内で実行可能な提案です。優先度に応じて着手判断ができます。"
      >
        {field.length === 0 ? (
          <EmptyState title="該当する提案はありません" />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {field.map((iss) => (
              <ProposalCard key={iss.id} iss={iss} variant="field" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function ProposalCard({
  iss,
  variant,
}: {
  iss: Issue;
  variant: "policy" | "field";
}) {
  const escalate = useStore((s) => s.escalateIssue);
  const start = useStore((s) => s.startIssue);
  const complete = useStore((s) => s.completeIssue);
  const reopen = useStore((s) => s.reopenIssue);

  const score = priorityScore(iss.urgency, iss.importance);
  const label = priorityLabel(score);

  const showAction = iss.status === "検討中";
  const showComplete =
    iss.status === "上申済" || iss.status === "対応着手";
  const canRevert = iss.status !== "検討中";

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Link
            href={`/staff/issues/${iss.id}`}
            className="text-sm font-semibold text-slate-900 hover:underline leading-snug"
          >
            {iss.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge tone="info">{iss.category}</Badge>
            {iss.departments.map((d) => (
              <Badge tone="outline" key={d}>
                {d}
              </Badge>
            ))}
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
            <StatusBadge status={iss.status} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <PriorityBadge label={label} className="!w-8 !h-8 !text-sm" />
          <span className="text-xs text-slate-500 tabular-nums">
            {iss.inquiryCount} 件
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-1">改善提案</p>
        <p className="text-sm text-slate-800 leading-relaxed">{iss.proposal}</p>
      </div>

      {iss.citizenVoices.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-1">代表的な市民の声</p>
          <ul className="text-xs text-slate-700 space-y-1">
            {iss.citizenVoices.slice(0, 2).map((v, i) => (
              <li key={i} className="leading-relaxed">
                「{v}」
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <Sparkline values={iss.weeklySeries} width={140} height={28} />
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {showAction && variant === "policy" && (
            <Button size="sm" onClick={() => escalate(iss.id)}>
              上申する
            </Button>
          )}
          {showAction && variant === "field" && (
            <Button size="sm" onClick={() => start(iss.id)}>
              着手登録
            </Button>
          )}
          {showComplete && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => complete(iss.id)}
            >
              完了登録
            </Button>
          )}
          {canRevert && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("検討中に差し戻します。よろしいですか？"))
                  reopen(iss.id);
              }}
            >
              差し戻す
            </Button>
          )}
          <Link
            href={`/staff/issues/${iss.id}`}
            className="border border-slate-300 px-3 h-8 inline-flex items-center text-xs text-slate-700 hover:bg-slate-50"
          >
            詳細
          </Link>
        </div>
      </div>
    </Card>
  );
}
