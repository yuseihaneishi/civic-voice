"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  PageContainer,
  PageTitle,
} from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { useHydrated } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import type { Letter } from "@/lib/types";

export default function ApprovalsPage() {
  const hydrated = useHydrated();
  const letters = useStore((s) => s.letters);

  const pending = letters
    .filter((l) => l.status === "決裁待ち" && l.draft)
    .sort((a, b) =>
      (a.draft?.approvalRequestedAt ?? "") <
      (b.draft?.approvalRequestedAt ?? "")
        ? -1
        : 1,
    );

  const returned = letters
    .filter((l) => l.status === "差し戻し")
    .sort((a, b) =>
      (a.draft?.returnedAt ?? "") < (b.draft?.returnedAt ?? "") ? 1 : -1,
    );

  const approved = letters
    .filter((l) => l.status === "回答済" && l.draft?.sentAt)
    .sort((a, b) => ((a.draft?.sentAt ?? "") < (b.draft?.sentAt ?? "") ? 1 : -1))
    .slice(0, 5);

  return (
    <PageContainer>
      <PageTitle
        title="決裁"
        description="職員から決裁依頼のあった回答案を確認し、承認・差し戻しを行います。承認すると差出人に回答が送付されます。（決裁者：広報課長）"
      />

      {!hydrated ? (
        <div className="h-24 bg-slate-100 animate-pulse rounded-xl" />
      ) : pending.length === 0 ? (
        <EmptyState
          title="決裁待ちの回答案はありません"
          description="職員が「決裁を依頼」した回答案がここに表示されます。"
          action={
            <Link
              href="/staff/letters"
              className="text-sm text-blue-700 hover:underline"
            >
              手紙一覧を開く →
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {pending.map((l) => (
            <PendingCard key={l.id} letter={l} />
          ))}
        </div>
      )}

      {hydrated && returned.length > 0 && (
        <div className="mt-8">
          <Card
            title="差し戻し中の回答案"
            description="担当職員が修正中です。修正後に再度決裁依頼が届きます。"
            padded={false}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2.5 px-5 font-normal whitespace-nowrap">
                    受付番号
                  </th>
                  <th className="text-left py-2.5 px-2 font-normal">AI要約</th>
                  <th className="text-left py-2.5 px-2 font-normal">
                    差し戻し理由
                  </th>
                  <th className="text-left py-2.5 px-2 font-normal whitespace-nowrap">
                    差し戻し日時
                  </th>
                  <th className="text-left py-2.5 px-5 font-normal">状況</th>
                </tr>
              </thead>
              <tbody>
                {returned.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/staff/letters/${l.id}`}
                        className="text-slate-800 hover:underline"
                      >
                        {l.id}
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-slate-700 max-w-[300px]">
                      <span className="leading-snug">{l.aiSummary}</span>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-slate-600 max-w-[240px]">
                      {l.draft?.returnReason ?? "—"}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {l.draft?.returnedAt}
                    </td>
                    <td className="py-2.5 px-5">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {hydrated && approved.length > 0 && (
        <div className="mt-8">
          <Card
            title="最近決裁した回答"
            description="承認・送付済みの回答（直近5件）です。"
            padded={false}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2.5 px-5 font-normal whitespace-nowrap">
                    受付番号
                  </th>
                  <th className="text-left py-2.5 px-2 font-normal">AI要約</th>
                  <th className="text-left py-2.5 px-2 font-normal">所管</th>
                  <th className="text-left py-2.5 px-2 font-normal whitespace-nowrap">
                    送付日時
                  </th>
                  <th className="text-left py-2.5 px-5 font-normal">状況</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/staff/letters/${l.id}`}
                        className="text-slate-800 hover:underline"
                      >
                        {l.id}
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-slate-700 max-w-[380px]">
                      <span className="leading-snug">{l.aiSummary}</span>
                    </td>
                    <td className="py-2.5 px-2 text-xs text-slate-600 whitespace-nowrap">
                      {l.department}
                    </td>
                    <td className="py-2.5 px-2 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {l.draft?.sentAt}
                    </td>
                    <td className="py-2.5 px-5">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

function PendingCard({ letter: l }: { letter: Letter }) {
  const sendReply = useStore((s) => s.sendReply);
  const returnDraft = useStore((s) => s.returnDraft);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <Card padded={false}>
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
        <Link
          href={`/staff/letters/${l.id}`}
          className="text-sm font-semibold text-slate-900 hover:underline"
        >
          {l.id}
        </Link>
        <PriorityBadge priority={l.priority} />
        <Badge tone={l.channel === "LINE" ? "success" : "muted"}>
          {l.channel}
        </Badge>
        <Badge tone="outline">{l.department}</Badge>
        <span className="text-xs text-slate-500 tabular-nums ml-auto">
          決裁依頼 {l.draft?.approvalRequestedAt}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-5 space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">AI要約</p>
            <p className="text-sm text-slate-800 leading-relaxed">
              {l.aiSummary}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">差出人</p>
            <p className="text-sm text-slate-700">
              {l.senderName}
              {l.senderAgeGroup || l.senderArea
                ? `（${[l.senderAgeGroup, l.senderArea]
                    .filter(Boolean)
                    .join("・")}）`
                : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">原文（抜粋）</p>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {l.body}
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-xs text-slate-500 mb-2">
            回答案
            {l.draft?.edited && (
              <span className="ml-2 text-slate-400">職員編集済</span>
            )}
          </p>
          <div className="border border-slate-200 bg-slate-50/60 rounded-lg p-4 max-h-56 overflow-y-auto">
            <p className="text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap">
              {l.draft?.body}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/50">
        {!showReturnForm ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => sendReply(l.id)}>
              承認して回答を送付
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowReturnForm(true)}
            >
              差し戻す
            </Button>
            <Link
              href={`/staff/letters/${l.id}`}
              className="text-xs text-slate-600 hover:text-slate-900 hover:underline ml-auto"
            >
              詳細を開く →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor={`return-reason-${l.id}`}
              className="block text-xs font-medium text-slate-700"
            >
              差し戻しの理由
              <span className="text-rose-700 ml-1">*</span>
            </label>
            <Textarea
              id={`return-reason-${l.id}`}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：情報配信の開始時期は未確定のため、表現を「検討中」に修正してください"
              autoFocus
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="danger"
                disabled={!reason.trim()}
                onClick={() => returnDraft(l.id, reason)}
              >
                この理由で差し戻す
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowReturnForm(false);
                  setReason("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
