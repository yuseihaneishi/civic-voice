"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { Badge, PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, PageContainer } from "@/components/ui/Card";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { useHydrated } from "@/lib/hooks";
import { categories, departments } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type {
  Category,
  Department,
  Letter,
  Priority,
} from "@/lib/types";

export default function LetterDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const hydrated = useHydrated();
  const letters = useStore((s) => s.letters);
  const letter = letters.find((l) => l.id === id);

  if (!hydrated) {
    return (
      <PageContainer>
        <div className="h-6 w-40 bg-slate-100 animate-pulse" />
      </PageContainer>
    );
  }

  if (!letter) notFound();

  return <LetterDetail key={letter.id} letter={letter} />;
}

function LetterDetail({ letter }: { letter: Letter }) {
  const updateLetter = useStore((s) => s.updateLetter);
  const confirmTriage = useStore((s) => s.confirmTriage);
  const generateDraft = useStore((s) => s.generateDraft);
  const markNoReply = useStore((s) => s.markNoReply);
  const generatingId = useStore((s) => s.generatingId);
  const generating = generatingId === letter.id;

  return (
    <PageContainer>
      <div className="mb-4">
        <Link
          href="/staff/letters"
          className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
        >
          ← 手紙一覧に戻る
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          {letter.id}
        </h1>
        <StatusBadge status={letter.status} />
        <PriorityBadge priority={letter.priority} />
        <Badge tone={letter.channel === "LINE" ? "success" : "muted"}>
          {letter.channel}
        </Badge>
        <span className="text-xs text-slate-500 tabular-nums">
          受付 {letter.receivedAt}
        </span>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 items-start">
        {/* 左：原文・AI解析・履歴 */}
        <div className="lg:col-span-3 space-y-4">
          <Card
            title="お手紙の原文"
            description={`差出人：${letter.senderName}${
              letter.senderAgeGroup ? `（${letter.senderAgeGroup}` : ""
            }${letter.senderArea ? `・${letter.senderArea}` : ""}${
              letter.senderAgeGroup || letter.senderArea ? "）" : ""
            }`}
          >
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {letter.body}
            </p>
          </Card>

          <Card
            title="AIによる要約・論点整理"
            description="受信時に自動生成されました。内容は原文とあわせてご確認ください。"
            action={
              <Badge tone="outline">振り分け信頼度 {letter.aiConfidence}%</Badge>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">要約</p>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {letter.aiSummary}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">論点</p>
                <ul className="space-y-1.5">
                  {letter.aiPoints.map((p) => (
                    <li
                      key={p}
                      className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="text-slate-400 shrink-0 mt-0.5">・</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <p className="text-xs text-slate-500">トーン判定</p>
                <Badge
                  tone={
                    letter.sentiment === "不満"
                      ? "warn"
                      : letter.sentiment === "感謝"
                        ? "success"
                        : "neutral"
                  }
                >
                  {letter.sentiment}
                </Badge>
              </div>
            </div>
          </Card>

          <Card title="対応履歴" padded={false}>
            <ol>
              {letter.log.map((entry, idx) => (
                <li
                  key={`${entry.at}-${idx}`}
                  className="px-5 py-3 border-b border-slate-100 last:border-0 flex items-baseline gap-4"
                >
                  <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0">
                    {entry.at}
                  </span>
                  <span className="text-sm text-slate-800 leading-relaxed">
                    {entry.action}
                    <span className="text-xs text-slate-500 ml-2">
                      {entry.by}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* 右：振り分け・回答案 */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="振り分け"
            description="AIの振り分け結果です。必要に応じて修正し、確定してください。"
          >
            <div className="space-y-4">
              <Field label="分野">
                <Select
                  value={letter.category}
                  onChange={(e) =>
                    updateLetter(
                      letter.id,
                      { category: e.target.value as Category },
                      `分野を「${e.target.value}」に変更`,
                    )
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="所管部局">
                <Select
                  value={letter.department}
                  onChange={(e) =>
                    updateLetter(
                      letter.id,
                      { department: e.target.value as Department },
                      `所管を「${e.target.value}」に変更`,
                    )
                  }
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="優先度">
                <Select
                  value={letter.priority}
                  onChange={(e) =>
                    updateLetter(
                      letter.id,
                      { priority: e.target.value as Priority },
                      `優先度を「${e.target.value}」に変更`,
                    )
                  }
                >
                  {(["高", "中", "低"] as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                {letter.aiPriorityReason && (
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    <span className="text-slate-400">AIの判定根拠：</span>
                    {letter.aiPriorityReason}
                  </p>
                )}
              </Field>
              {letter.status === "新着" && (
                <div className="pt-1 flex flex-col gap-2">
                  <Button onClick={() => confirmTriage(letter.id)}>
                    振り分けを確定
                  </Button>
                  {letter.replyRequired && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markNoReply(letter.id)}
                    >
                      回答不要として記録
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card
            title="回答案"
            description={
              letter.replyRequired
                ? "AIが下書きを作成します。職員が確認・編集のうえ決裁に回してください。"
                : "この手紙は回答不要として記録されています。"
            }
          >
            {!letter.replyRequired && !letter.draft ? (
              <p className="text-sm text-slate-500">
                回答は作成しません。所管部局への共有のみ行われます。
              </p>
            ) : generating ? (
              <div className="space-y-2 py-2" aria-live="polite">
                <p className="text-sm text-slate-700">
                  AIが回答案を生成しています…
                </p>
                <div className="h-3 bg-slate-100 animate-pulse" />
                <div className="h-3 bg-slate-100 animate-pulse w-11/12" />
                <div className="h-3 bg-slate-100 animate-pulse w-4/5" />
                <div className="h-3 bg-slate-100 animate-pulse w-2/3" />
              </div>
            ) : !letter.draft ? (
              <div className="py-2">
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  原文とAI要約をもとに、過去の回答例・所管部局の施策情報を参照した回答案を生成します。
                </p>
                <Button onClick={() => generateDraft(letter.id)}>
                  AIで回答案を生成
                </Button>
              </div>
            ) : (
              <DraftEditor
                key={`${letter.draft.generatedAt}-${letter.status}`}
                letter={letter}
              />
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function DraftEditor({ letter }: { letter: Letter }) {
  const generateDraft = useStore((s) => s.generateDraft);
  const saveDraft = useStore((s) => s.saveDraft);
  const requestApproval = useStore((s) => s.requestApproval);

  const draft = letter.draft!;
  const [draftBody, setDraftBody] = useState(draft.body);
  const draftDirty = draftBody !== draft.body;

  const editable =
    letter.status === "回答案作成中" || letter.status === "差し戻し";

  return (
    <div className="space-y-3">
      {letter.status === "差し戻し" && (
        <div className="border border-rose-200 bg-rose-50 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-rose-800">
            広報課長から差し戻されました（{draft.returnedAt}）
          </p>
          {draft.returnReason && (
            <p className="mt-1 text-xs text-rose-700 leading-relaxed">
              理由：{draft.returnReason}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Badge tone="info">AI生成</Badge>
        <span className="tabular-nums">{draft.generatedAt}</span>
        {draft.edited && <Badge tone="muted">職員編集済</Badge>}
        {draft.sentAt && <Badge tone="success">送付済 {draft.sentAt}</Badge>}
      </div>

      <Textarea
        rows={14}
        value={draftBody}
        onChange={(e) => setDraftBody(e.target.value)}
        disabled={!editable}
        className="text-[13px]"
      />

      {editable && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={!draftDirty}
            onClick={() => saveDraft(letter.id, draftBody)}
          >
            編集内容を保存
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateDraft(letter.id)}
          >
            再生成
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (draftDirty) saveDraft(letter.id, draftBody);
              requestApproval(letter.id);
            }}
          >
            決裁を依頼
          </Button>
        </div>
      )}

      {letter.status === "決裁待ち" && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            広報課長の決裁待ちです（依頼日時：{draft.approvalRequestedAt}）。
            承認・差し戻しは
            <Link
              href="/staff/approvals"
              className="font-medium underline hover:text-amber-900 mx-0.5"
            >
              決裁ページ
            </Link>
            から行えます。
          </p>
        </div>
      )}

      {letter.status === "回答済" && (
        <p className="text-xs text-slate-500 leading-relaxed">
          この回答は送付済みです。内容の変更はできません。
        </p>
      )}
    </div>
  );
}
