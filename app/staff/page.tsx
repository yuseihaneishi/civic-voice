"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Badge,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  PageContainer,
  PageTitle,
  Stat,
} from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { useHydrated } from "@/lib/hooks";
import { departments } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type {
  Channel,
  Department,
  IntakeStatus,
  Triage,
} from "@/lib/types";
import { priorityLabel, priorityScore } from "@/lib/utils";

const statuses: ("all" | IntakeStatus)[] = [
  "all",
  "受付済",
  "確認中",
  "対応中",
  "対応完了",
  "保留",
];
const channels: ("all" | Channel)[] = [
  "all",
  "メール",
  "電話",
  "窓口",
  "Web",
  "目安箱",
];
const triages: ("all" | Triage)[] = [
  "all",
  "市政反映",
  "現場対応",
  "情報共有のみ",
  "対応不要",
];

export default function StaffInbox() {
  const hydrated = useHydrated();
  const inquiries = useStore((s) => s.inquiries);
  const filters = useStore((s) => s.staffFilters);
  const setFilters = useStore((s) => s.setStaffFilters);
  const reset = useStore((s) => s.resetStaffFilters);

  const filtered = useMemo(() => {
    let list = [...inquiries];
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.summary.toLowerCase().includes(q) ||
          i.body.toLowerCase().includes(q) ||
          i.citizenName.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q),
      );
    }
    if (filters.department !== "all")
      list = list.filter((i) => i.department === filters.department);
    if (filters.status !== "all")
      list = list.filter((i) => i.status === filters.status);
    if (filters.channel !== "all")
      list = list.filter((i) => i.channel === filters.channel);
    if (filters.triage !== "all")
      list = list.filter((i) => i.triage === filters.triage);
    if (filters.sortBy === "priority_desc") {
      list.sort(
        (a, b) =>
          priorityScore(b.urgency, b.importance) -
          priorityScore(a.urgency, a.importance),
      );
    } else {
      list.sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
    }
    return list;
  }, [inquiries, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.department !== "all" ||
    filters.status !== "all" ||
    filters.channel !== "all" ||
    filters.triage !== "all" ||
    filters.sortBy !== "date_desc";

  const newCount = inquiries.filter((i) => i.status === "受付済").length;
  const inProgress = inquiries.filter((i) => i.status === "対応中").length;
  const exceptions = inquiries.filter((i) => i.isException).length;
  const fresh = inquiries.filter((i) => i.isFresh).length;

  return (
    <PageContainer>
      <PageTitle
        title="問い合わせ一覧"
        description="経路を問わず、すべての受付済み問い合わせを一覧で確認できます。優先度・所管部署・分野で絞り込みが可能です。"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat
          label="未確認"
          value={hydrated ? newCount : 0}
          hint={hydrated && fresh > 0 ? `うち新着 ${fresh} 件` : "本日受付分"}
        />
        <Stat label="対応中" value={hydrated ? inProgress : 0} />
        <Stat
          label="例外検知"
          value={hydrated ? exceptions : 0}
          hint="部署横断・要上申候補"
        />
        <Stat
          label="累計"
          value={hydrated ? inquiries.length : 0}
          hint="今月"
        />
      </div>

      <Card padded={false}>
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-span-4">
            <Input
              type="search"
              placeholder="本文・氏名・受付番号で検索"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="text-sm h-9"
            />
          </div>
          <Select
            value={filters.department}
            onChange={(e) =>
              setFilters({
                department: e.target.value as "all" | Department,
              })
            }
            className="md:col-span-2 text-sm h-9"
          >
            <option value="all">すべての所管</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                status: e.target.value as "all" | IntakeStatus,
              })
            }
            className="md:col-span-2 text-sm h-9"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "すべての状況" : s}
              </option>
            ))}
          </Select>
          <Select
            value={filters.channel}
            onChange={(e) =>
              setFilters({ channel: e.target.value as "all" | Channel })
            }
            className="md:col-span-1 text-sm h-9"
          >
            {channels.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "経路" : c}
              </option>
            ))}
          </Select>
          <Select
            value={filters.triage}
            onChange={(e) =>
              setFilters({ triage: e.target.value as "all" | Triage })
            }
            className="md:col-span-1 text-sm h-9"
          >
            {triages.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "振分" : t}
              </option>
            ))}
          </Select>
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({
                sortBy: e.target.value as "date_desc" | "priority_desc",
              })
            }
            className="md:col-span-1 text-sm h-9"
          >
            <option value="date_desc">新着順</option>
            <option value="priority_desc">優先度順</option>
          </Select>
          <div className="md:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => reset()}>
                条件をクリア
              </Button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="条件に合う問い合わせはありません"
              description="検索条件を見直してください。"
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-200">
                <th className="text-left py-2.5 px-4 font-normal whitespace-nowrap">
                  受付日時
                </th>
                <th className="text-left py-2.5 px-2 font-normal">経路</th>
                <th className="text-left py-2.5 px-2 font-normal">分野</th>
                <th className="text-left py-2.5 px-2 font-normal">所管</th>
                <th className="text-left py-2.5 px-2 font-normal">要点</th>
                <th className="text-left py-2.5 px-2 font-normal">優先度</th>
                <th className="text-left py-2.5 px-2 font-normal">振分</th>
                <th className="text-left py-2.5 px-2 font-normal">状況</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const score = priorityScore(i.urgency, i.importance);
                const label = priorityLabel(score);
                return (
                  <tr
                    key={i.id}
                    className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {i.receivedAt}
                    </td>
                    <td className="py-3 px-2">
                      <Badge tone="muted">{i.channel}</Badge>
                    </td>
                    <td className="py-3 px-2 text-slate-700 whitespace-nowrap">
                      {i.category}
                    </td>
                    <td className="py-3 px-2 text-slate-700 whitespace-nowrap">
                      {i.department}
                    </td>
                    <td className="py-3 px-2 text-slate-800 max-w-[420px]">
                      <Link
                        href={`/staff/inquiries/${i.id}`}
                        className="hover:underline leading-snug"
                      >
                        {i.summary}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {i.isFresh && <Badge tone="info">新着</Badge>}
                        {i.isException && (
                          <Badge tone="warn">例外検知：部署横断</Badge>
                        )}
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
                      <Badge
                        tone={
                          i.triage === "市政反映"
                            ? "info"
                            : i.triage === "現場対応"
                              ? "neutral"
                              : "muted"
                        }
                      >
                        {i.triage}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={i.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </PageContainer>
  );
}
