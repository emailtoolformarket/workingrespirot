import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays } from "lucide-react";
import type { EngagementPoint } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const opens = payload.find((entry: any) => entry.dataKey === "opens")?.value ?? 0;
  const clicks = payload.find((entry: any) => entry.dataKey === "clicks")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl shadow-slate-900/10">
      <p className="font-display text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <div className="mt-1.5 space-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800 tabular-nums">
          <span className="h-2 w-2 rounded-full bg-indigo-600" />
          {Number(opens).toLocaleString("en-US")} opens
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800 tabular-nums">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {Number(clicks).toLocaleString("en-US")} clicks
        </p>
      </div>
    </div>
  );
}

const formatK = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`);

export default function EngagementChart({ data }: { data: EngagementPoint[] }) {
  const { push } = useToast();
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const selectRange = (next: "7d" | "30d") => {
    if (next === "30d") {
      push("30-day history is on the roadmap — showing the last 7 days.", "warning");
      return;
    }
    setRange(next);
  };

  return (
    <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2" style={{ animationDelay: "280ms" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
            Email engagement
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">Opens vs. clicks across your last sends</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 sm:flex">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-indigo-600" /> Opens
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Clicks
            </span>
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(["7d", "30d"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectRange(option)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 font-display text-xs font-semibold transition-all duration-200 ${
                  range === option
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                {option === "7d" ? "7 days" : "30 days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="opensFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              tickFormatter={formatK}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#c7d2fe", strokeWidth: 1.5 }} />
            <Area
              type="monotone"
              dataKey="opens"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="url(#opensFill)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="1 0"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
              animationDuration={1200}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
