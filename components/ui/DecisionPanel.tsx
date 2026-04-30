"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import type { Issue, IssueStatus, Triage } from "@/lib/types";

const allStatuses: IssueStatus[] = [
  "検討中",
  "上申済",
  "対応着手",
  "対応完了",
];
const allTriages: Triage[] = [
  "市政反映",
  "現場対応",
  "情報共有のみ",
  "対応不要",
];

export function DecisionPanel({ issue }: { issue: Issue }) {
  const updateIssue = useStore((s) => s.updateIssue);
  const reopen = useStore((s) => s.reopenIssue);
  const escalate = useStore((s) => s.escalateIssue);
  const start = useStore((s) => s.startIssue);
  const complete = useStore((s) => s.completeIssue);
  const pushToast = useStore((s) => s.pushToast);

  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [triage, setTriage] = useState<Triage>(issue.triage);
  const [note, setNote] = useState("");

  const dirty = status !== issue.status || triage !== issue.triage;

  const onCancel = () => {
    setStatus(issue.status);
    setTriage(issue.triage);
    setNote("");
    setEditing(false);
  };

  const onSave = () => {
    if (!dirty && !note.trim()) {
      setEditing(false);
      return;
    }
    updateIssue(issue.id, { status, triage }, note.trim() || undefined);
    pushToast({
      tone: "success",
      title: "判断を更新しました",
      description: status !== issue.status ? `状態：${status}` : undefined,
    });
    setNote("");
    setEditing(false);
  };

  return (
    <Card title="判断" description="課題に対する現在の判断と、必要に応じた変更">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={issue.status} />
        <span className="text-xs text-slate-500">×</span>
        <span className="text-xs text-slate-700">{issue.triage}</span>
      </div>

      {!editing && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {issue.status === "検討中" && issue.triage === "市政反映" && (
            <Button size="sm" onClick={() => escalate(issue.id)}>
              市政検討案件として上申する
            </Button>
          )}
          {issue.status === "検討中" && issue.triage === "現場対応" && (
            <Button size="sm" onClick={() => start(issue.id)}>
              現場対応として着手
            </Button>
          )}
          {(issue.status === "上申済" || issue.status === "対応着手") && (
            <Button size="sm" variant="secondary" onClick={() => complete(issue.id)}>
              対応完了として記録
            </Button>
          )}
          {issue.status !== "検討中" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("検討中に差し戻します。よろしいですか？"))
                  reopen(issue.id);
              }}
            >
              検討中に差し戻す
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            判断を編集
          </Button>
        </div>
      )}

      {editing && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <Field label="状態">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="振り分け">
            <Select
              value={triage}
              onChange={(e) => setTriage(e.target.value as Triage)}
            >
              {allTriages.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="変更理由・メモ"
            hint="判断履歴に記録されます（任意）"
          >
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="例：類似事例増加のため上申に切替、など"
            />
          </Field>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onSave} disabled={!dirty && !note.trim()}>
              保存する
            </Button>
            <Button size="sm" variant="secondary" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
