import type { Metadata } from "next";
import "./globals.css";
import { ToastViewport } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "知事への手紙 ブロードリスニング支援システム",
  description:
    "LINE等経由で寄せられた県民の声の要約・振り分け・回答案作成を効率化する職員向けシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
