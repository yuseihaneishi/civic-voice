"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
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
import { categories, channels, departments } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type {
  Category,
  Channel,
  Department,
  LetterStatus,
} from "@/lib/types";

const statuses: ("all" | LetterStatus)[] = [
  "all",
  "新着",
  "振り分け済",
  "回答案作成中",
  "決裁待ち",
  "差し戻し",
  "回答済",
  "回答不要",
];

const priorityOrder = { 高: 0, 中: 1, 低: 2 } as const;

export default function LettersPage() {
  const hydrated = useHydrated();
  const letters = useStore((s) => s.letters);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const simulateIncoming = useStore((s) => s.simulateIncoming);

  const lastFetchAt = useStore((s) => s.lastFetchAt);
  const [fetching, setFetching] = useState(false);

  const handleFetch = () => {
    if (fetching) return;
    setFetching(true);
    setTimeout(() => {
      simulateIncoming();
      setFetching(false);
    }, 5000);
  };

  const filtered = useMemo(() => {
    let list = [...letters];
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.aiSummary.toLowerCase().includes(q) ||
          l.body.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          (l.senderArea ?? "").includes(q),
      );
    }
    if (filters.category !== "all")
      list = list.filter((l) => l.category === filters.category);
    if (filters.department !== "all")
      list = list.filter((l) => l.department === filters.department);
    if (filters.status !== "all")
      list = list.filter((l) => l.status === filters.status);
    if (filters.channel !== "all")
      list = list.filter((l) => l.channel === filters.channel);
    if (filters.sortBy === "priority_desc") {
      list.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    } else {
      list.sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
    }
    return list;
  }, [letters, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== "all" ||
    filters.department !== "all" ||
    filters.status !== "all" ||
    filters.channel !== "all" ||
    filters.sortBy !== "date_desc";

  const fresh = letters.filter((l) => l.status === "新着").length;
  const drafting = letters.filter((l) => l.status === "回答案作成中").length;
  const waiting = letters.filter((l) => l.status === "決裁待ち").length;
  const replied = letters.filter((l) => l.status === "回答済").length;

  return (
    <PageContainer>
      <PageTitle
        title="手紙一覧"
        description="LINE等の経路を問わず、届いた手紙をAIが要約・振り分けした状態で一覧できます。"
        action={
          <div className="text-right">
            <Button
              variant="secondary"
              onClick={handleFetch}
              disabled={fetching}
              className="min-w-56"
            >
              {fetching ? (
                <>
                  <span
                    className="inline-block w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin"
                    aria-hidden
                  />
                  取得中…
                </>
              ) : (
                "LINEから最新の手紙を取得"
              )}
            </Button>
            <p className="text-xs text-slate-500 mt-1.5 tabular-nums">
              最終取得：
              {hydrated && lastFetchAt
                ? `${lastFetchAt}（手動）`
                : "本日 08:00（自動）"}
            </p>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat
          label="新着（振り分け確認待ち）"
          value={hydrated ? fresh : 0}
          hint="AIの振り分け結果を確認してください"
        />
        <Stat label="回答案作成中" value={hydrated ? drafting : 0} />
        <Stat label="決裁待ち" value={hydrated ? waiting : 0} />
        <Stat label="回答済" value={hydrated ? replied : 0} hint="一覧表示分" />
      </div>

      <Card padded={false}>
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <div className="md:col-span-4">
            <Input
              type="search"
              placeholder="本文・要約・受付番号・市町で検索"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="text-sm h-9"
            />
          </div>
          <Select
            value={filters.category}
            onChange={(e) =>
              setFilters({ category: e.target.value as "all" | Category })
            }
            className="md:col-span-2 text-sm h-9"
          >
            <option value="all">すべての分野</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={filters.department}
            onChange={(e) =>
              setFilters({ department: e.target.value as "all" | Department })
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
              setFilters({ status: e.target.value as "all" | LetterStatus })
            }
            className="md:col-span-1 text-sm h-9"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "状況" : s}
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
            <option value="all">経路</option>
            {channels.map((c) => (
              <option key={c} value={c}>
                {c}
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
              <Button variant="ghost" size="sm" onClick={() => resetFilters()}>
                クリア
              </Button>
            )}
          </div>
        </div>

        {!hydrated ? (
          <div className="p-5">
            <div className="h-24 bg-slate-100 animate-pulse" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="条件に合う手紙はありません"
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
                <th className="text-left py-2.5 px-2 font-normal whitespace-nowrap">
                  差出人
                </th>
                <th className="text-left py-2.5 px-2 font-normal">AI要約</th>
                <th className="text-left py-2.5 px-2 font-normal">分野</th>
                <th className="text-left py-2.5 px-2 font-normal">所管</th>
                <th className="text-left py-2.5 px-2 font-normal">優先度</th>
                <th className="text-left py-2.5 px-2 font-normal">状況</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50"
                >
                  <td className="py-3 px-4 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                    {l.receivedAt}
                  </td>
                  <td className="py-3 px-2">
                    <Badge tone={l.channel === "LINE" ? "success" : "muted"}>
                      {l.channel}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs text-slate-600 whitespace-nowrap">
                    {l.senderArea ?? "—"}
                    {l.senderAgeGroup ? `・${l.senderAgeGroup}` : ""}
                  </td>
                  <td className="py-3 px-2 text-slate-800 max-w-[380px]">
                    <Link
                      href={`/staff/letters/${l.id}`}
                      className="hover:underline leading-snug"
                    >
                      {l.aiSummary}
                    </Link>
                    {!l.replyRequired && (
                      <div className="mt-1">
                        <Badge tone="muted">回答不要</Badge>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-slate-700 whitespace-nowrap text-xs">
                    {l.category}
                  </td>
                  <td className="py-3 px-2 text-slate-700 whitespace-nowrap text-xs">
                    {l.department}
                  </td>
                  <td className="py-3 px-2">
                    <PriorityBadge priority={l.priority} />
                  </td>
                  <td className="py-3 px-2">
                    <StatusBadge status={l.status} />
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
