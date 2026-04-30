"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CitizenDraft,
  Inquiry,
  Issue,
  IssueStatus,
  StaffFilters,
  Toast,
} from "./types";
import { seedInquiries, seedIssues } from "./seed";
import {
  formatDateTime,
  inferCategory,
  inferDepartment,
  inferPriority,
  newInquiryId,
  summarize,
} from "./utils";

type AppState = {
  inquiries: Inquiry[];
  issues: Issue[];
  citizenDraft: CitizenDraft | null;
  staffFilters: StaffFilters;
  toasts: Toast[];

  submitInquiry: (data: {
    title: string;
    body: string;
    category?: Inquiry["category"];
    wantsReply: boolean;
    citizenName: string;
    citizenId: string;
  }) => Inquiry;
  saveDraft: (draft: Omit<CitizenDraft, "updatedAt">) => void;
  clearDraft: () => void;

  updateInquiry: (id: string, partial: Partial<Inquiry>) => void;
  setStaffFilters: (partial: Partial<StaffFilters>) => void;
  resetStaffFilters: () => void;

  setIssueStatus: (id: string, status: IssueStatus, note?: string) => void;
  updateIssue: (
    id: string,
    partial: { triage?: Issue["triage"]; status?: IssueStatus },
    note?: string,
  ) => void;
  escalateIssue: (id: string) => void;
  startIssue: (id: string) => void;
  completeIssue: (id: string) => void;
  reopenIssue: (id: string) => void;

  addInquiryComment: (
    id: string,
    body: string,
    author: { role: "citizen" | "staff" | "mayor"; name: string },
  ) => void;
  addIssueComment: (
    id: string,
    body: string,
    author: { role: "citizen" | "staff" | "mayor"; name: string },
  ) => void;
  deleteInquiryComment: (inquiryId: string, commentId: string) => void;
  deleteIssueComment: (issueId: string, commentId: string) => void;

  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  resetData: () => void;
};

const defaultStaffFilters: StaffFilters = {
  search: "",
  department: "all",
  status: "all",
  channel: "all",
  triage: "all",
  sortBy: "date_desc",
};

const STORAGE_KEY = "civic-voice-store-v4";

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      inquiries: seedInquiries,
      issues: seedIssues,
      citizenDraft: null,
      staffFilters: defaultStaffFilters,
      toasts: [],

      submitInquiry: ({
        title,
        body,
        category,
        citizenName,
        citizenId,
      }) => {
        const now = new Date();
        const inferredCategory = category ?? inferCategory(`${title} ${body}`);
        const department = inferDepartment(inferredCategory);
        const { urgency, importance } = inferPriority(`${title} ${body}`);
        const seq = get().inquiries.length + 1;
        const summary = title || summarize(body);
        const linkedIssue = get().issues.find(
          (i) => i.category === inferredCategory,
        );
        const triage = importance >= 4 ? "市政反映" : "現場対応";

        const created: Inquiry = {
          id: newInquiryId(seq),
          receivedAt: formatDateTime(now),
          channel: "Web",
          citizenName,
          citizenId,
          body,
          summary,
          category: inferredCategory,
          department,
          status: "受付済",
          sentiment: "建設的",
          urgency,
          importance,
          triage,
          relatedIssueIds: linkedIssue ? [linkedIssue.id] : [],
          isFresh: true,
        };
        set((state) => ({
          inquiries: [created, ...state.inquiries],
          issues: linkedIssue
            ? state.issues.map((i) =>
                i.id === linkedIssue.id
                  ? {
                      ...i,
                      inquiryCount: i.inquiryCount + 1,
                      weeklySeries: [
                        ...i.weeklySeries.slice(0, -1),
                        (i.weeklySeries[i.weeklySeries.length - 1] ?? 0) + 1,
                      ],
                    }
                  : i,
              )
            : state.issues,
          citizenDraft: null,
        }));
        get().pushToast({
          tone: "success",
          title: "ご意見を受け付けました",
          description: `受付番号 ${created.id} ／ ${department}にて確認します`,
        });
        return created;
      },

      saveDraft: (draft) =>
        set({
          citizenDraft: { ...draft, updatedAt: formatDateTime() },
        }),
      clearDraft: () => set({ citizenDraft: null }),

      updateInquiry: (id, partial) =>
        set((state) => ({
          inquiries: state.inquiries.map((i) =>
            i.id === id ? { ...i, ...partial } : i,
          ),
        })),

      setStaffFilters: (partial) =>
        set((state) => ({
          staffFilters: { ...state.staffFilters, ...partial },
        })),
      resetStaffFilters: () => set({ staffFilters: defaultStaffFilters }),

      setIssueStatus: (id, status, note) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status,
                  decisionLog: [
                    ...i.decisionLog,
                    { at: formatDateTime(), status, note },
                  ],
                }
              : i,
          ),
        })),

      updateIssue: (id, partial, note) =>
        set((state) => ({
          issues: state.issues.map((i) => {
            if (i.id !== id) return i;
            const next = { ...i, ...partial };
            const statusChanged =
              partial.status !== undefined && partial.status !== i.status;
            const log = statusChanged
              ? [
                  ...i.decisionLog,
                  {
                    at: formatDateTime(),
                    status: partial.status as IssueStatus,
                    note,
                  },
                ]
              : i.decisionLog;
            return { ...next, decisionLog: log };
          }),
        })),

      escalateIssue: (id) => {
        get().setIssueStatus(id, "上申済", "市政反映候補として上申");
        get().pushToast({
          tone: "info",
          title: "上申しました",
          description: "市政検討案件としてダッシュボードに反映されます",
        });
      },
      startIssue: (id) => {
        get().setIssueStatus(id, "対応着手", "現場対応として着手");
        get().pushToast({
          tone: "info",
          title: "着手登録しました",
          description: "所管部署で対応を開始します",
        });
      },
      completeIssue: (id) => {
        get().setIssueStatus(id, "対応完了", "対応完了として記録");
        get().pushToast({
          tone: "success",
          title: "対応完了として記録しました",
        });
      },
      reopenIssue: (id) => {
        get().setIssueStatus(id, "検討中", "判断を見直し、検討中に戻しました");
        get().pushToast({
          tone: "info",
          title: "判断を差し戻しました",
          description: "検討中に戻しました",
        });
      },

      addInquiryComment: (id, body, author) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const comment = {
          id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          at: formatDateTime(),
          authorRole: author.role,
          authorName: author.name,
          body: trimmed,
        };
        set((state) => ({
          inquiries: state.inquiries.map((i) =>
            i.id === id
              ? { ...i, comments: [...(i.comments ?? []), comment] }
              : i,
          ),
        }));
        get().pushToast({ tone: "success", title: "コメントを追加しました" });
      },

      addIssueComment: (id, body, author) => {
        const trimmed = body.trim();
        if (!trimmed) return;
        const comment = {
          id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          at: formatDateTime(),
          authorRole: author.role,
          authorName: author.name,
          body: trimmed,
        };
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id
              ? { ...i, comments: [...(i.comments ?? []), comment] }
              : i,
          ),
        }));
        get().pushToast({ tone: "success", title: "コメントを追加しました" });
      },

      deleteInquiryComment: (inquiryId, commentId) =>
        set((state) => ({
          inquiries: state.inquiries.map((i) =>
            i.id === inquiryId
              ? {
                  ...i,
                  comments: (i.comments ?? []).filter(
                    (c) => c.id !== commentId,
                  ),
                }
              : i,
          ),
        })),

      deleteIssueComment: (issueId, commentId) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  comments: (i.comments ?? []).filter(
                    (c) => c.id !== commentId,
                  ),
                }
              : i,
          ),
        })),

      pushToast: (t) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({ toasts: [...state.toasts, { ...t, id }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((x) => x.id !== id) }));
        }, 4000);
      },
      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      resetData: () =>
        set({
          inquiries: seedInquiries,
          issues: seedIssues,
          citizenDraft: null,
          staffFilters: defaultStaffFilters,
          toasts: [],
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inquiries: state.inquiries,
        issues: state.issues,
        citizenDraft: state.citizenDraft,
      }),
    },
  ),
);

export function useInquiry(id: string) {
  return useStore((s) => s.inquiries.find((i) => i.id === id));
}

export function useIssue(id: string) {
  return useStore((s) => s.issues.find((i) => i.id === id));
}
