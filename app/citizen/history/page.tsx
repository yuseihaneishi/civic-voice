"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import {
  Card,
  EmptyState,
  PageContainer,
  PageTitle,
} from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { useHydrated } from "@/lib/hooks";
import { roleProfiles } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { IntakeStatus } from "@/lib/types";

export default function CitizenHistoryPage() {
  const profile = roleProfiles.citizen;
  const hydrated = useHydrated();
  const inquiries = useStore((s) => s.inquiries);
  const [statusFilter, setStatusFilter] = useState<"all" | IntakeStatus>(
    "all",
  );

  const list = useMemo(() => {
    if (!hydrated) return [];
    return inquiries
      .filter(
        (i) =>
          i.citizenName === profile.defaultName ||
          i.citizenId === profile.defaultId,
      )
      .filter((i) => (statusFilter === "all" ? true : i.status === statusFilter))
      .sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
  }, [hydrated, inquiries, statusFilter, profile.defaultName, profile.defaultId]);

  return (
    <PageContainer>
      <PageTitle
        title="過去のお問い合わせ"
        description="ご自身が市役所宛てに送信したご意見・ご要望の一覧です。"
        action={
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | IntakeStatus)
            }
            className="text-sm"
          >
            <option value="all">すべての状況</option>
            <option value="受付済">受付済</option>
            <option value="確認中">確認中</option>
            <option value="対応中">対応中</option>
            <option value="対応完了">対応完了</option>
            <option value="保留">保留</option>
          </Select>
        }
      />

      <Card padded={false}>
        {list.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={
                hydrated
                  ? "条件に合うお問い合わせはありません"
                  : "読み込み中..."
              }
              description="状況フィルターを変更するか、新しい問い合わせを投稿してください。"
              action={
                <Link
                  href="/citizen"
                  className="text-xs text-slate-700 underline"
                >
                  投稿フォームへ
                </Link>
              }
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-200 bg-slate-50/50">
                <th className="text-left py-2.5 px-4 font-normal">受付日時</th>
                <th className="text-left py-2.5 px-2 font-normal">経路</th>
                <th className="text-left py-2.5 px-2 font-normal">分野</th>
                <th className="text-left py-2.5 px-2 font-normal">所管部署</th>
                <th className="text-left py-2.5 px-2 font-normal">内容</th>
                <th className="text-left py-2.5 px-2 font-normal">状況</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50/60"
                >
                  <td className="py-3 px-4 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                    {i.receivedAt}
                  </td>
                  <td className="py-3 px-2">
                    <Badge tone="muted">{i.channel}</Badge>
                  </td>
                  <td className="py-3 px-2 text-slate-700">{i.category}</td>
                  <td className="py-3 px-2 text-slate-700">{i.department}</td>
                  <td className="py-3 px-2 text-slate-800 max-w-[420px] leading-snug">
                    {i.summary}
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
