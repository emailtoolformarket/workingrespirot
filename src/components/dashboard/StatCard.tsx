import type { ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

type Accent = "indigo" | "sky" | "amber" | "emerald";

const ACCENTS: Record<Accent, { tile: string; stroke: string; stop: string }> = {
  indigo: { tile: "bg-indigo-50 text-indigo-600", stroke: "#4f46e5", stop: "#4f46e5" },
  sky: { tile: "bg-sky-50 text-sky-600", stroke: "#0284c7", stop: "#0284c7" },
  amber: { tile: "bg-amber-50 text-amber-600", stroke: "#d97706", stop: "#d97706" },
  emerald: { tile: "bg-emerald-50 text-emerald-600", stroke: "#059669", stop: "#059669" },
};

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  delta: { label: string; positive: boolean };
  spark: number[];
  accent: Accent;
  index: number;
}

export default function StatCard({ label, value, icon, delta, spark, accent, index }: StatCardProps) {
  const colors = ACCENTS[accent];
  const data = spark.map((v, i) => ({ i, v }));
  const gradientId = `spark-${accent}`;

  return (
    <article
      className="group animate-fade-up relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/8"
      style={{ animationDelay: `${120 + index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${colors.tile}`}
        >
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold tabular-nums ${
            delta.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}
        >
          {delta.positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta.label}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-display text-[28px] leading-none font-bold tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>

      <div className="mt-3 h-10 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.stop} stopOpacity={0.22} />
                <stop offset="100%" stopColor={colors.stop} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
