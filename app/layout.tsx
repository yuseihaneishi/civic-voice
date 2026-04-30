import type { Metadata } from "next";
import "./globals.css";
import { ToastViewport } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "市民の声プラットフォーム",
  description:
    "市民からのご意見・ご要望を市政へ反映するための行政内向けプラットフォーム",
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
