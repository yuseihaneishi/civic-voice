import type { Category, Department, Letter, Priority } from "./types";

export const categoryToDepartment: Record<Category, Department> = {
  "医療・福祉": "健康医療福祉部",
  "子育て・教育": "子ども若者部",
  "道路・交通": "土木交通部",
  "環境・琵琶湖": "琵琶湖環境部",
  "産業・観光": "商工観光労働部",
  "防災・安全": "防災危機管理局",
  "県政運営・手続": "総合企画部",
  その他: "総合企画部",
};

export function priorityToneClass(p: Priority): string {
  switch (p) {
    case "高":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "中":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "低":
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

/** 回答案の定型パラグラフ（カテゴリ別・デモ用の擬似AI生成） */
const categoryBodies: Record<Category, string> = {
  "医療・福祉":
    "県では、地域医療構想に基づき、医療提供体制の確保と福祉サービスの充実に取り組んでいるところです。いただいたご意見は、健康医療福祉部において現状の調査とあわせて検討し、市町や関係機関とも連携しながら改善に努めてまいります。",
  "子育て・教育":
    "県では、子育て世帯を支える環境づくりを重点施策として位置づけ、市町と連携した支援制度の拡充を進めているところです。いただいたご意見は、子ども・子育て施策の検討にあたっての貴重なご意見として、関係部局で共有し、今後の制度設計の参考とさせていただきます。",
  "道路・交通":
    "ご指摘の箇所につきましては、所管の土木事務所において現地の状況を確認いたします。緊急に対応が必要な場合は応急措置を行うとともに、抜本的な改良については、地域の交通量や優先度を踏まえ、計画的な整備を検討してまいります。",
  "環境・琵琶湖":
    "琵琶湖の保全と再生は県政の最重要課題のひとつであり、水草対策や湖辺域の環境改善に継続的に取り組んでいるところです。いただいたご意見を踏まえ、現地の状況を確認のうえ、市町・関係団体と連携して対応を検討してまいります。",
  "産業・観光":
    "県では、地域経済の活性化と持続可能な観光地域づくりに取り組んでいるところです。いただいたご意見は、商工観光労働部において関係市町・事業者とも共有し、今後の施策の検討に活かしてまいります。",
  "防災・安全":
    "県民の皆さまの安全・安心の確保は県政の基本であり、防災体制の強化と迅速な情報発信に努めているところです。いただいたご意見を踏まえ、関係機関と連携して対策の充実を図ってまいります。",
  "県政運営・手続":
    "県政の運営や手続きに関する貴重なご意見をいただき、ありがとうございます。いただいた内容は所管部局で共有し、わかりやすく利用しやすい県政の実現に向けて、改善を検討してまいります。",
  その他:
    "いただいたご意見は、所管部局において内容を確認し、今後の県政運営の参考とさせていただきます。",
};

/** 手紙の内容からAI回答案（下書き）を組み立てる */
export function generateReplyBody(letter: Letter): string {
  const opening = `このたびは「知事への手紙」にご意見をお寄せいただき、ありがとうございます。\n${letter.aiSummary}とのご意見として拝見いたしました。`;
  const body = categoryBodies[letter.category];
  const closing = `今後とも、県民の皆さまの声を大切にした県政運営に努めてまいりますので、引き続きお気づきの点がございましたらお聞かせください。\n\n（所管：${letter.department}）`;
  return `${opening}\n\n${body}\n\n${closing}`;
}

export function formatDateTime(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
