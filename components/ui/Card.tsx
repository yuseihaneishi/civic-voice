import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  padded?: boolean;
};

export function Card({
  title,
  description,
  children,
  className = "",
  action,
  padded = true,
}: CardProps) {
  return (
    <section
      className={`border border-slate-200 bg-white rounded-xl overflow-hidden ${className}`}
    >
      {(title || description || action) && (
        <header className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

type StatProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { dir: "up" | "down" | "flat"; text: string };
};

export function Stat({ label, value, hint, trend }: StatProps) {
  return (
    <div className="border border-slate-200 bg-white rounded-xl p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
        {value}
      </p>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={
                trend.dir === "up"
                  ? "text-rose-700"
                  : trend.dir === "down"
                    ? "text-emerald-700"
                    : "text-slate-500"
              }
            >
              {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "—"}{" "}
              {trend.text}
            </span>
          )}
          {hint && <span className="text-slate-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-screen-xl mx-auto px-6 py-8 w-full">
      {children}
    </main>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-10 text-center">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {description && (
        <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
