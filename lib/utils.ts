import type { Category, Department } from "./types";
import { categoryToDepartment } from "./seed";

export function priorityScore(urgency: number, importance: number): number {
  return urgency * importance;
}

export function priorityLabel(score: number): "S" | "A" | "B" | "C" {
  if (score >= 20) return "S";
  if (score >= 12) return "A";
  if (score >= 6) return "B";
  return "C";
}

export function priorityToneClass(label: "S" | "A" | "B" | "C"): string {
  switch (label) {
    case "S":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "A":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "B":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "C":
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

const categoryKeywords: { category: Category; words: string[] }[] = [
  { category: "税", words: ["住民税", "税金", "確定申告", "課税", "税務"] },
  {
    category: "道路・交通",
    words: ["道路", "通学路", "歩道", "公園", "遊具", "信号", "交差点", "側溝"],
  },
  {
    category: "子育て・教育",
    words: [
      "保育",
      "保育園",
      "子ども",
      "子育て",
      "学校",
      "学童",
      "預かり",
      "幼稚園",
    ],
  },
  { category: "福祉", words: ["介護", "高齢", "福祉", "障害", "認定"] },
  { category: "環境", words: ["ごみ", "環境", "騒音", "公害", "ペット"] },
  {
    category: "イベント・観光",
    words: ["観光", "祭", "イベント", "観光客"],
  },
  {
    category: "行政手続",
    words: ["住民票", "戸籍", "マイナンバー", "申請", "手続"],
  },
];

export function inferCategory(text: string): Category {
  for (const { category, words } of categoryKeywords) {
    if (words.some((w) => text.includes(w))) return category;
  }
  return "暮らし";
}

export function inferDepartment(category: Category): Department {
  return categoryToDepartment[category];
}

export function inferPriority(text: string): {
  urgency: number;
  importance: number;
} {
  let urgency = 2;
  let importance = 2;
  if (/危険|緊急|至急|事故|怪我/.test(text)) urgency = 5;
  else if (/早急|早めに|早く/.test(text)) urgency = 4;
  else if (/困っ|不便/.test(text)) urgency = 3;
  if (/子ども|児童|高齢|福祉|安全/.test(text)) importance = 4;
  if (/制度|改善|提案|見直し/.test(text)) importance = Math.max(importance, 3);
  if (/全市|全員|多く/.test(text)) importance = 5;
  return { urgency, importance };
}

export function summarize(body: string, max = 60): string {
  const cleaned = body.replace(/\s+/g, "").replace(/[。、]/g, "");
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max) + "…";
}

export function formatDateTime(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function newInquiryId(seq: number): string {
  const padded = String(500 + seq).padStart(4, "0");
  return `INQ-2026-${padded}`;
}
