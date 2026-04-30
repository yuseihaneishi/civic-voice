export type Channel = "メール" | "電話" | "窓口" | "Web" | "目安箱";

export type Department =
  | "市民税課"
  | "高齢福祉課"
  | "道路維持課"
  | "子育て支援課"
  | "環境政策課"
  | "観光振興課"
  | "総務課";

export type Category =
  | "税"
  | "暮らし"
  | "福祉"
  | "道路・交通"
  | "子育て・教育"
  | "環境"
  | "イベント・観光"
  | "行政手続"
  | "その他";

export type IntakeStatus =
  | "受付済"
  | "確認中"
  | "対応中"
  | "対応完了"
  | "保留";

export type Triage =
  | "市政反映"
  | "現場対応"
  | "情報共有のみ"
  | "対応不要";

export type Sentiment = "建設的" | "不満" | "情報提供" | "感謝";

export type Comment = {
  id: string;
  at: string;
  authorRole: "citizen" | "staff" | "mayor";
  authorName: string;
  body: string;
};

export type IssueStatus =
  | "検討中"
  | "上申済"
  | "対応着手"
  | "対応完了";

export type Inquiry = {
  id: string;
  receivedAt: string;
  channel: Channel;
  citizenName: string;
  citizenAge?: number;
  citizenArea?: string;
  body: string;
  summary: string;
  category: Category;
  department: Department;
  status: IntakeStatus;
  sentiment: Sentiment;
  urgency: number;
  importance: number;
  triage: Triage;
  relatedIssueIds: string[];
  isException?: boolean;
  staffNote?: string;
  citizenId?: string;
  isFresh?: boolean;
  comments?: Comment[];
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: Category;
  departments: Department[];
  inquiryCount: number;
  trend: "急増" | "増加" | "横ばい" | "減少";
  urgency: number;
  importance: number;
  triage: Triage;
  proposal: string;
  citizenVoices: string[];
  relatedIssueIds: string[];
  weeklySeries: number[];
  status: IssueStatus;
  decisionLog: { at: string; status: IssueStatus; note?: string }[];
  comments?: Comment[];
};

export type CitizenDraft = {
  category: Category;
  title: string;
  body: string;
  wantsReply: boolean;
  updatedAt: string;
};

export type Toast = {
  id: string;
  tone: "success" | "info" | "warn" | "alert";
  title: string;
  description?: string;
};

export type StaffFilters = {
  search: string;
  department: "all" | Department;
  status: "all" | IntakeStatus;
  channel: "all" | Channel;
  triage: "all" | Triage;
  sortBy: "date_desc" | "priority_desc";
};

export type Role = "citizen" | "staff" | "mayor";

export type RoleProfile = {
  role: Role;
  label: string;
  description: string;
  signInLabel: string;
  defaultId: string;
  defaultName: string;
  href: string;
  bullets: string[];
};
