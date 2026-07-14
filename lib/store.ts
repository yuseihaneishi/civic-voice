"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Letter, LetterFilters, LetterStatus, Toast } from "./types";
import { incomingPool, seedLetters, staffProfile } from "./seed";
import { formatDateTime, generateReplyBody } from "./utils";

type AppState = {
  letters: Letter[];
  filters: LetterFilters;
  toasts: Toast[];
  /** AI回答案を生成中の手紙ID（演出用） */
  generatingId: string | null;
  incomingIndex: number;
  /** 手動取得を最後に実行した日時（デモ用） */
  lastFetchAt: string | null;

  updateLetter: (id: string, partial: Partial<Letter>, logAction?: string) => void;
  confirmTriage: (id: string) => void;
  generateDraft: (id: string) => void;
  saveDraft: (id: string, body: string) => void;
  requestApproval: (id: string) => void;
  returnDraft: (id: string, reason: string) => void;
  sendReply: (id: string) => void;
  markNoReply: (id: string) => void;
  simulateIncoming: () => void;

  setFilters: (partial: Partial<LetterFilters>) => void;
  resetFilters: () => void;

  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  resetData: () => void;
};

const defaultFilters: LetterFilters = {
  search: "",
  category: "all",
  department: "all",
  status: "all",
  channel: "all",
  sortBy: "date_desc",
};

const STORAGE_KEY = "governor-letter-store-v1";

function appendLog(letter: Letter, action: string, by = staffProfile.name): Letter {
  return {
    ...letter,
    log: [...letter.log, { at: formatDateTime(), action, by }],
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      letters: seedLetters,
      filters: defaultFilters,
      toasts: [],
      generatingId: null,
      incomingIndex: 0,
      lastFetchAt: null,

      updateLetter: (id, partial, logAction) =>
        set((state) => ({
          letters: state.letters.map((l) => {
            if (l.id !== id) return l;
            const next = { ...l, ...partial, isFresh: false };
            return logAction ? appendLog(next, logAction) : next;
          }),
        })),

      confirmTriage: (id) => {
        const letter = get().letters.find((l) => l.id === id);
        if (!letter) return;
        get().updateLetter(
          id,
          { status: "振り分け済" },
          `振り分け内容を確認・確定（${letter.department}）`,
        );
        get().pushToast({
          tone: "success",
          title: "振り分けを確定しました",
          description: `${letter.department} 所管として登録されました`,
        });
      },

      generateDraft: (id) => {
        const letter = get().letters.find((l) => l.id === id);
        if (!letter || get().generatingId) return;
        set({ generatingId: id });
        setTimeout(() => {
          const current = get().letters.find((l) => l.id === id);
          if (!current) {
            set({ generatingId: null });
            return;
          }
          set((state) => ({
            generatingId: null,
            letters: state.letters.map((l) =>
              l.id === id
                ? appendLog(
                    {
                      ...l,
                      status: "回答案作成中",
                      isFresh: false,
                      draft: {
                        body: generateReplyBody(current),
                        generatedAt: formatDateTime(),
                        generator: "AI",
                        edited: false,
                      },
                    },
                    "AIが回答案を生成",
                    "システム",
                  )
                : l,
            ),
          }));
          get().pushToast({
            tone: "success",
            title: "AIが回答案を生成しました",
            description: "内容を確認・編集のうえ、決裁を依頼してください",
          });
        }, 1600);
      },

      saveDraft: (id, body) => {
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id && l.draft
              ? appendLog(
                  { ...l, draft: { ...l.draft, body, edited: true } },
                  "回答案を編集",
                )
              : l,
          ),
        }));
        get().pushToast({ tone: "success", title: "回答案を保存しました" });
      },

      requestApproval: (id) => {
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id && l.draft
              ? appendLog(
                  {
                    ...l,
                    status: "決裁待ち" as LetterStatus,
                    draft: {
                      ...l.draft,
                      approvalRequestedAt: formatDateTime(),
                      returnedAt: undefined,
                      returnReason: undefined,
                    },
                  },
                  "決裁を依頼（広報課長）",
                )
              : l,
          ),
        }));
        get().pushToast({
          tone: "info",
          title: "決裁を依頼しました",
          description: "広報課長の決裁後に回答を送付できます",
        });
      },

      returnDraft: (id, reason) => {
        const trimmed = reason.trim();
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id && l.draft
              ? appendLog(
                  {
                    ...l,
                    status: "差し戻し" as LetterStatus,
                    draft: {
                      ...l.draft,
                      returnedAt: formatDateTime(),
                      returnReason: trimmed || undefined,
                    },
                  },
                  trimmed
                    ? `決裁を差し戻し（理由：${trimmed}）`
                    : "決裁を差し戻し（回答案の修正へ）",
                  "広報課長",
                )
              : l,
          ),
        }));
        get().pushToast({
          tone: "warn",
          title: "差し戻しました",
          description: "担当職員が理由を確認し、回答案を修正できます",
        });
      },

      sendReply: (id) => {
        set((state) => ({
          letters: state.letters.map((l) =>
            l.id === id && l.draft
              ? appendLog(
                  {
                    ...l,
                    status: "回答済" as LetterStatus,
                    draft: { ...l.draft, sentAt: formatDateTime() },
                  },
                  "決裁完了、回答を送付",
                  "広報課長",
                )
              : l,
          ),
        }));
        get().pushToast({
          tone: "success",
          title: "回答を送付しました",
          description: "差出人に受信チャネル経由で回答が届きます",
        });
      },

      markNoReply: (id) => {
        get().updateLetter(
          id,
          { status: "回答不要", replyRequired: false },
          "回答不要として記録（所管部局に共有）",
        );
        get().pushToast({
          tone: "info",
          title: "回答不要として記録しました",
        });
      },

      simulateIncoming: () => {
        const { incomingIndex, letters } = get();
        const now = formatDateTime();
        const remaining = incomingPool.filter(
          (p) => !letters.some((l) => l.id === p.id),
        );
        if (remaining.length === 0) {
          set({ lastFetchAt: now });
          get().pushToast({
            tone: "info",
            title: "新着の手紙はありませんでした",
            description:
              "デモ用の手紙はすべて取得済みです。「デモデータをリセット」で戻せます",
          });
          return;
        }
        const item = remaining[0];
        const created: Letter = {
          ...item,
          receivedAt: now,
          isFresh: true,
          log: [
            {
              at: now,
              action: "LINE経由で受信、AIが要約・振り分けを実行",
              by: "システム",
            },
          ],
        };
        set({
          letters: [created, ...letters],
          incomingIndex: incomingIndex + 1,
          lastFetchAt: now,
        });
        get().pushToast({
          tone: "info",
          title: "LINEから1件の手紙を取得しました",
          description: `AIが要約・振り分けを実行：${item.department}／優先度${item.priority}`,
        });
      },

      setFilters: (partial) =>
        set((state) => ({ filters: { ...state.filters, ...partial } })),
      resetFilters: () => set({ filters: defaultFilters }),

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
          letters: seedLetters,
          filters: defaultFilters,
          toasts: [],
          generatingId: null,
          incomingIndex: 0,
          lastFetchAt: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        letters: state.letters,
        incomingIndex: state.incomingIndex,
        lastFetchAt: state.lastFetchAt,
      }),
    },
  ),
);

export function useLetter(id: string) {
  return useStore((s) => s.letters.find((l) => l.id === id));
}
