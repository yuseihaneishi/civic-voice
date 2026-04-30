import type { ReactNode } from "react";

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
      className={`inline-flex items-center px-2 py-0.5 text-xs border whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({
  label,
  className = "",
}: {
  label: "S" | "A" | "B" | "C";
  className?: string;
}) {
  const tone =
    label === "S"
      ? "bg-rose-100 text-rose-800"
      : label === "A"
        ? "bg-amber-100 text-amber-800"
        : label === "B"
          ? "bg-slate-100 text-slate-700"
          : "bg-slate-50 text-slate-500";
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold ${tone} ${className}`}
    >
      {label}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const tone: Tone =
    status === "対応完了"
      ? "success"
      : status === "対応中" || status === "対応着手"
        ? "info"
        : status === "保留"
          ? "warn"
          : status === "上申済"
            ? "info"
            : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}
