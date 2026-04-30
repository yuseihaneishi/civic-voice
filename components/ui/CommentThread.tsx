"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import type { Comment, Role } from "@/lib/types";

const roleLabel: Record<Role, string> = {
  citizen: "市民",
  staff: "職員",
  mayor: "幹部",
};

const roleAccent: Record<Role, string> = {
  citizen: "border-slate-300 bg-slate-50",
  staff: "border-blue-200 bg-blue-50/40",
  mayor: "border-amber-200 bg-amber-50/30",
};

type Props = {
  title?: string;
  description?: string;
  comments: Comment[];
  currentRole: "citizen" | "staff" | "mayor";
  currentName: string;
  onAdd: (body: string) => void;
  onDelete?: (commentId: string) => void;
  placeholder?: string;
};

export function CommentThread({
  title = "コメント",
  description = "部署内・関係者間のディスカッションスペースです。",
  comments,
  currentRole,
  currentName,
  onAdd,
  onDelete,
  placeholder = "コメントを入力してください",
}: Props) {
  const [draft, setDraft] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    onAdd(body);
    setDraft("");
  };

  return (
    <Card title={title} description={description} padded={false}>
      <ul className="divide-y divide-slate-100">
        {comments.length === 0 && (
          <li className="p-5 text-xs text-slate-500">
            まだコメントはありません。最初のコメントを投稿してください。
          </li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="p-4">
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex items-center justify-center w-9 h-9 text-xs border shrink-0 ${roleAccent[c.authorRole]}`}
              >
                {roleLabel[c.authorRole]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-slate-800 font-medium">
                    {c.authorName}
                  </span>
                  <span className="tabular-nums">{c.at}</span>
                </div>
                <p className="mt-1 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                  {c.body}
                </p>
              </div>
              {onDelete && c.authorName === currentName && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("このコメントを削除しますか？")) onDelete(c.id);
                  }}
                  className="text-xs text-slate-500 hover:text-rose-700 shrink-0"
                  aria-label="コメントを削除"
                >
                  削除
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <form
        onSubmit={onSubmit}
        className="border-t border-slate-200 p-4 bg-slate-50/40 space-y-3"
      >
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 text-xs border shrink-0 ${roleAccent[currentRole]}`}
          >
            {roleLabel[currentRole]}
          </span>
          <div className="flex-1">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={placeholder}
              maxLength={1000}
              className="bg-white"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {currentName} として投稿
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={draft.trim().length === 0}
              >
                コメントする
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
