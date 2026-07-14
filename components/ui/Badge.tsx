import type { ReactNode } from "react";
import type { LetterStatus, Priority } from "@/lib/types";

type Tone =
  | "neutral"
  | "info"
  | "warn"
  | "alert"
  | "success"
  | "muted"
  | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  alert: "bg-rose-50 text-rose-800 border-rose-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  muted: "bg-slate-50 text-slate-600 border-slate-200",
  outline: "bg-white text-slate-700 border-slate-300",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs border rounded-full whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className = "",
}: {
  priority: Priority;
  className?: string;
}) {
  const tone =
    priority === "高"
      ? "bg-rose-100 text-rose-800"
      : priority === "中"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${tone} ${className}`}
    >
      {priority}
    </span>
  );
}

const statusTones: Record<LetterStatus, Tone> = {
  新着: "alert",
  振り分け済: "neutral",
  回答案作成中: "info",
  決裁待ち: "warn",
  回答済: "success",
  回答不要: "muted",
};

export function StatusBadge({ status }: { status: LetterStatus }) {
  return <Badge tone={statusTones[status]}>{status}</Badge>;
}
