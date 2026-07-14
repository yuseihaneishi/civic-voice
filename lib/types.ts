export type Channel = "LINE" | "Webフォーム" | "メール" | "郵送";

export type Department =
  | "健康医療福祉部"
  | "子ども若者部"
  | "教育委員会"
  | "土木交通部"
  | "琵琶湖環境部"
  | "商工観光労働部"
  | "防災危機管理局"
  | "総合企画部";

export type Category =
  | "医療・福祉"
  | "子育て・教育"
  | "道路・交通"
  | "環境・琵琶湖"
  | "産業・観光"
  | "防災・安全"
  | "県政運営・手続"
  | "その他";

export type LetterStatus =
  | "新着"
  | "振り分け済"
  | "回答案作成中"
  | "決裁待ち"
  | "回答済"
  | "回答不要";

export type Priority = "高" | "中" | "低";

export type Sentiment = "要望" | "提案" | "不満" | "感謝";

export type LogEntry = {
  at: string;
  action: string;
  by: string;
};

export type ReplyDraft = {
  body: string;
  generatedAt: string;
  generator: "AI" | "職員";
  edited: boolean;
  approvalRequestedAt?: string;
  sentAt?: string;
};

export type Letter = {
  id: string;
  receivedAt: string;
  channel: Channel;
  senderName: string;
  senderAgeGroup?: string;
  senderArea?: string;
  body: string;
  aiSummary: string;
  aiPoints: string[];
  sentiment: Sentiment;
  /** AIによる振り分けの信頼度（0-100） */
  aiConfidence: number;
  category: Category;
  department: Department;
  priority: Priority;
  replyRequired: boolean;
  status: LetterStatus;
  draft?: ReplyDraft;
  log: LogEntry[];
  isFresh?: boolean;
};

export type Theme = {
  id: string;
  title: string;
  category: Category;
  count: number;
  trend: "急増" | "増加" | "横ばい" | "減少";
  weeklySeries: number[];
  sample: string;
};

export type Toast = {
  id: string;
  tone: "success" | "info" | "warn" | "alert";
  title: string;
  description?: string;
};

export type LetterFilters = {
  search: string;
  category: "all" | Category;
  department: "all" | Department;
  status: "all" | LetterStatus;
  channel: "all" | Channel;
  sortBy: "date_desc" | "priority_desc";
};

export type StaffProfile = {
  name: string;
  id: string;
  section: string;
};
