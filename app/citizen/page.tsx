"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  PageContainer,
  PageTitle,
} from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { categories, roleProfiles } from "@/lib/seed";
import type { Category, CitizenDraft } from "@/lib/types";
import { useHydrated } from "@/lib/hooks";

export default function CitizenHome() {
  const profile = roleProfiles.citizen;
  const hydrated = useHydrated();
  const inquiries = useStore((s) => s.inquiries);
  const draft = useStore((s) => s.citizenDraft);

  const myInquiries = useMemo(
    () =>
      hydrated
        ? inquiries.filter(
            (i) =>
              i.citizenName === profile.defaultName ||
              i.citizenId === profile.defaultId,
          )
        : [],
    [hydrated, inquiries, profile.defaultName, profile.defaultId],
  );

  return (
    <PageContainer>
      <PageTitle
        title={`こんにちは、${profile.defaultName} 様`}
        description="市政へのご意見・ご要望を投稿いただけます。お寄せいただいた内容は所管部署で確認し、市政・業務改善の検討に活用します。"
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card
            title="新しいご意見・ご要望を投稿する"
            description="ご記入いただいた内容は所管部署にて確認します。回答が必要な場合のみご連絡先をご記入ください。"
          >
            {hydrated ? (
              <CitizenForm
                key={draft?.updatedAt ?? "fresh"}
                initialDraft={draft ?? null}
              />
            ) : (
              <FormSkeleton />
            )}
          </Card>

          <div className="mt-5">
            <Card
              title="同じ分野で寄せられている主な声"
              description="他の市民からも同様のご意見が寄せられています。重複しても差し支えありませんので、ご自身の言葉でご記入ください。"
            >
              <ul className="space-y-3 text-sm">
                <li className="border-l-2 border-slate-300 pl-3 text-slate-700">
                  住民税の計算方法・通知書の表記に関するご相談（27件）
                </li>
                <li className="border-l-2 border-slate-300 pl-3 text-slate-700">
                  通学路の安全に関するご報告（14件）
                </li>
                <li className="border-l-2 border-slate-300 pl-3 text-slate-700">
                  子育て関連手続きのオンライン化のご要望（11件）
                </li>
              </ul>
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <Card
            title="あなたのお問い合わせ状況"
            description={`過去のお問い合わせ：${hydrated ? myInquiries.length : 0}件`}
            action={
              <Link
                href="/citizen/history"
                className="text-xs text-slate-700 underline"
              >
                すべて見る
              </Link>
            }
            padded={false}
          >
            {hydrated && myInquiries.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="まだお問い合わせはありません"
                  description="ご意見・ご要望を投稿すると、こちらに状況が表示されます。"
                />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {myInquiries.slice(0, 5).map((i) => (
                  <li key={i.id} className="p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="tabular-nums">{i.receivedAt}</span>
                      <Badge tone="muted">{i.channel}</Badge>
                      {i.isFresh && <Badge tone="info">新着</Badge>}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-800 leading-snug line-clamp-2">
                      {i.summary}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge tone="outline">{i.department}</Badge>
                      <StatusBadge status={i.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="お問い合わせの取り扱いについて">
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li>・ ご記入いただいた内容は所管部署で内容確認のうえ、関連する課題と合わせて整理します。</li>
              <li>・ 同種のご意見が一定数以上集まった場合、市政上の検討課題として取り扱う場合があります。</li>
              <li>・ 個人情報は法令に基づき適切に管理し、目的外利用は行いません。</li>
            </ul>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-9 bg-slate-100" />
      <div className="h-9 bg-slate-100" />
      <div className="h-32 bg-slate-100" />
    </div>
  );
}

type CitizenFormProps = {
  initialDraft: CitizenDraft | null;
};

function CitizenForm({ initialDraft }: CitizenFormProps) {
  const profile = roleProfiles.citizen;
  const submitInquiry = useStore((s) => s.submitInquiry);
  const saveDraft = useStore((s) => s.saveDraft);
  const clearDraft = useStore((s) => s.clearDraft);
  const draft = useStore((s) => s.citizenDraft);
  const pushToast = useStore((s) => s.pushToast);

  const [category, setCategory] = useState<Category>(
    initialDraft?.category ?? "税",
  );
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [body, setBody] = useState(initialDraft?.body ?? "");
  const [wantsReply, setWantsReply] = useState(
    initialDraft?.wantsReply ?? false,
  );

  const canSubmit = body.trim().length >= 10;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    submitInquiry({
      title: title.trim(),
      body: body.trim(),
      category,
      wantsReply,
      citizenName: profile.defaultName,
      citizenId: profile.defaultId,
    });
    setTitle("");
    setBody("");
    setWantsReply(false);
    setCategory("税");
  };

  const onSaveDraft = () => {
    saveDraft({ category, title, body, wantsReply });
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <Field label="分野" required>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="件名" hint="20文字程度で簡潔にご記入ください（任意）">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：住民税の通知書の表記について"
          maxLength={50}
        />
      </Field>
      <Field
        label="ご意見・ご要望の内容"
        required
        hint={`${body.length}/2000文字（10文字以上で送信できます）`}
      >
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          maxLength={2000}
          placeholder="お困りのこと、ご提案などをご自由にご記入ください。"
        />
      </Field>
      <label className="flex items-center gap-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={wantsReply}
          onChange={(e) => setWantsReply(e.target.checked)}
          className="w-4 h-4 border-slate-300"
        />
        市役所からの回答を希望する
      </label>
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!canSubmit}>
          送信する
        </Button>
        <Button type="button" variant="secondary" onClick={onSaveDraft}>
          下書き保存
        </Button>
        {draft && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (confirm("下書きを破棄しますか？")) {
                clearDraft();
                setCategory("税");
                setTitle("");
                setBody("");
                setWantsReply(false);
                pushToast({ tone: "info", title: "下書きを破棄しました" });
              }
            }}
          >
            下書きを破棄
          </Button>
        )}
        {draft && (
          <span className="text-xs text-slate-500">
            下書きを {draft.updatedAt} に保存しました
          </span>
        )}
      </div>
    </form>
  );
}
