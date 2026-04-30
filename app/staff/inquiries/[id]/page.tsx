"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Badge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  PageContainer,
  PageTitle,
} from "@/components/ui/Card";
import { CommentThread } from "@/components/ui/CommentThread";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { useHydrated } from "@/lib/hooks";
import { departments, categories, roleProfiles } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type {
  Category,
  Department,
  Inquiry,
  IntakeStatus,
  Triage,
} from "@/lib/types";
import { priorityLabel, priorityScore } from "@/lib/utils";

export default function InquiryDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const hydrated = useHydrated();
  const inquiries = useStore((s) => s.inquiries);
  const inquiry = inquiries.find((i) => i.id === id);

  if (!hydrated) {
    return (
      <PageContainer>
        <div className="h-6 w-40 bg-slate-100 animate-pulse" />
      </PageContainer>
    );
  }

  if (!inquiry) notFound();

  return <InquiryEditor key={inquiry.id} inquiry={inquiry} />;
}

function InquiryEditor({ inquiry }: { inquiry: Inquiry }) {
  const issues = useStore((s) => s.issues);
  const updateInquiry = useStore((s) => s.updateInquiry);
  const pushToast = useStore((s) => s.pushToast);
  const addComment = useStore((s) => s.addInquiryComment);
  const deleteComment = useStore((s) => s.deleteInquiryComment);
  const staffProfile = roleProfiles.staff;

  const [draft, setDraft] = useState<Inquiry>(inquiry);

  const score = priorityScore(draft.urgency, draft.importance);
  const label = priorityLabel(score);
  const related = inquiry.relatedIssueIds
    .map((rid) => issues.find((x) => x.id === rid))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const dirty =
    draft.category !== inquiry.category ||
    draft.department !== inquiry.department ||
    draft.urgency !== inquiry.urgency ||
    draft.importance !== inquiry.importance ||
    draft.triage !== inquiry.triage ||
    draft.status !== inquiry.status ||
    (draft.staffNote ?? "") !== (inquiry.staffNote ?? "");

  const onSave = () => {
    if (!dirty) return;
    updateInquiry(inquiry.id, {
      category: draft.category,
      department: draft.department,
      urgency: draft.urgency,
      importance: draft.importance,
      triage: draft.triage,
      status: draft.status,
      staffNote: draft.staffNote,
      isFresh: false,
    });
    pushToast({
      tone: "success",
      title: "保存しました",
      description: "問い合わせの分類・状況を更新しました",
    });
  };

  const onMarkInProgress = () => {
    const next = { ...draft, status: "対応中" as IntakeStatus };
    setDraft(next);
    updateInquiry(inquiry.id, { status: "対応中", isFresh: false });
    pushToast({ tone: "info", title: "「対応中」に更新しました" });
  };

  return (
    <PageContainer>
      <div className="mb-4 text-xs">
        <Link href="/staff" className="text-slate-600 hover:underline">
          ← 問い合わせ一覧へ戻る
        </Link>
      </div>
      <PageTitle
        title={inquiry.summary}
        description={`受付番号 ${inquiry.id} ／ ${inquiry.receivedAt} ／ ${inquiry.channel}`}
        action={
          <div className="flex items-center gap-2">
            {draft.status !== "対応中" && draft.status !== "対応完了" && (
              <Button variant="secondary" size="sm" onClick={onMarkInProgress}>
                対応中にする
              </Button>
            )}
            <Button size="sm" onClick={onSave} disabled={!dirty}>
              {dirty ? "確定して保存" : "保存済み"}
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="受信内容">
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {inquiry.body}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-xs pt-4 border-t border-slate-100">
              <div>
                <dt className="text-slate-500">差出人</dt>
                <dd className="text-slate-800">
                  {inquiry.citizenName}
                  {inquiry.citizenAge && `（${inquiry.citizenAge}歳）`}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">居住エリア</dt>
                <dd className="text-slate-800">
                  {inquiry.citizenArea ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">受信経路</dt>
                <dd className="text-slate-800">{inquiry.channel}</dd>
              </div>
              <div>
                <dt className="text-slate-500">市民番号</dt>
                <dd className="text-slate-800 tabular-nums">
                  {inquiry.citizenId ?? "-"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card
            title="判定結果と確認"
            description="システムによる初期判定の結果です。誤りがある場合は修正することで、以降の判定が改善されます。"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="分野">
                <Select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      category: e.target.value as Category,
                    })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="所管部署">
                <Select
                  value={draft.department}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      department: e.target.value as Department,
                    })
                  }
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="緊急度（1-5）">
                <Select
                  value={String(draft.urgency)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      urgency: Number(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="重要度（1-5）">
                <Select
                  value={String(draft.importance)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      importance: Number(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="振り分け">
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      "市政反映",
                      "現場対応",
                      "情報共有のみ",
                      "対応不要",
                    ] as Triage[]
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDraft({ ...draft, triage: t })}
                      className={`px-3 py-2 text-xs border transition-colors ${
                        draft.triage === t
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="対応状況">
                <Select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as IntakeStatus,
                    })
                  }
                >
                  {(
                    [
                      "受付済",
                      "確認中",
                      "対応中",
                      "対応完了",
                      "保留",
                    ] as IntakeStatus[]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-5">
              <Field
                label="職員メモ（部署内共有用）"
                hint="対応経緯や引き継ぎ事項をご記入ください。"
              >
                <Textarea
                  rows={3}
                  value={draft.staffNote ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, staffNote: e.target.value })
                  }
                />
              </Field>
            </div>
          </Card>

          <CommentThread
            title="ディスカッション"
            description="この問い合わせに関する部署内での議論や対応経緯を記録できます。"
            comments={inquiry.comments ?? []}
            currentRole="staff"
            currentName={staffProfile.defaultName}
            onAdd={(body) =>
              addComment(inquiry.id, body, {
                role: "staff",
                name: staffProfile.defaultName,
              })
            }
            onDelete={(cid) => deleteComment(inquiry.id, cid)}
          />
        </div>

        <div className="space-y-5">
          <Card title="優先度">
            <div className="flex items-center gap-4">
              <PriorityBadge label={label} className="!w-12 !h-12 !text-lg" />
              <div>
                <p className="text-xs text-slate-500">緊急度 × 重要度</p>
                <p className="text-2xl font-semibold tabular-nums">{score}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              緊急度 {draft.urgency} × 重要度 {draft.importance} ＝ {score}
              {inquiry.isException &&
                "。同一市民が複数部署にまたがる相談を行っている例外パターンを検知しています。"}
            </p>
          </Card>

          <Card title="現在の状況">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={draft.status} />
              <Badge
                tone={draft.triage === "市政反映" ? "info" : "neutral"}
              >
                {draft.triage}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              所管：{draft.department}
            </p>
          </Card>

          <Card title="関連する課題">
            {related.length === 0 ? (
              <p className="text-sm text-slate-500">関連課題はありません。</p>
            ) : (
              <ul className="space-y-3">
                {related.map((iss) => (
                  <li
                    key={iss.id}
                    className="border-l-2 border-slate-300 pl-3"
                  >
                    <Link
                      href={`/staff/issues/${iss.id}`}
                      className="text-sm text-slate-800 hover:underline leading-snug"
                    >
                      {iss.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      累計 {iss.inquiryCount} 件 ／ トレンド：{iss.trend}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
