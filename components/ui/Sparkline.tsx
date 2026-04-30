type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  ariaLabel?: string;
};

export function Sparkline({
  values,
  width = 220,
  height = 56,
  ariaLabel,
}: SparklineProps) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const padding = 4;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const stepX = innerW / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + innerH - ((v - min) / span) * innerH;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${path} L${padding + innerW} ${padding + innerH} L${padding} ${padding + innerH} Z`;
  const lastX = points[points.length - 1][0];
  const lastY = points[points.length - 1][1];
  return (
    <svg width={width} height={height} role="img" aria-label={ariaLabel}>
      <path d={areaPath} fill="#0f172a" fillOpacity={0.04} />
      <path
        d={path}
        fill="none"
        stroke="#0f172a"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill="#0f172a" />
    </svg>
  );
}

type BarChartProps = {
  values: number[];
  labels: string[];
  highlightLast?: boolean;
  height?: number;
};

export function BarChart({
  values,
  labels,
  highlightLast,
  height = 160,
}: BarChartProps) {
  const max = Math.max(...values, 1);
  const labelHeight = 16;
  const usableHeight = height - labelHeight;
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {values.map((v, i) => {
          const barH = Math.max(2, Math.round((v / max) * usableHeight));
          const isLast = highlightLast && i === values.length - 1;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group"
              style={{ height }}
            >
              <div
                className="text-[10px] text-slate-500 tabular-nums leading-none mb-1"
                style={{ height: labelHeight }}
              >
                {v}
              </div>
              <div
                className={`w-full transition-colors ${
                  isLast
                    ? "bg-slate-900"
                    : "bg-slate-300 group-hover:bg-slate-400"
                }`}
                style={{ height: barH }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {labels.map((l, i) => (
          <div
            key={i}
            className="flex-1 text-[10px] text-slate-500 text-center"
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

type DonutProps = {
  segments: { label: string; value: number; color: string }[];
};

export function Donut({ segments }: DonutProps) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = 60;
  const stroke = 16;
  const c = 2 * Math.PI * radius;
  const offsets = segments.reduce<number[]>((acc) => {
    const prev = acc[acc.length - 1] ?? 0;
    const prevLen =
      acc.length === 0 ? 0 : (segments[acc.length - 1].value / total) * c;
    acc.push(prev + prevLen);
    return acc;
  }, []);
  return (
    <div className="flex items-center gap-5">
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle
          cx={75}
          cy={75}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        {segments.map((s, idx) => {
          const len = (s.value / total) * c;
          return (
            <circle
              key={s.label}
              cx={75}
              cy={75}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offsets[idx]}
              transform="rotate(-90 75 75)"
            />
          );
        })}
      </svg>
      <ul className="space-y-2 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3"
              style={{ background: s.color }}
            />
            <span className="text-slate-700">{s.label}</span>
            <span className="text-slate-500 tabular-nums">{s.value}件</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
