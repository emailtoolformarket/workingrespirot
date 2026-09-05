import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutProps {
  openRate: number;
  clickRate: number;
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-xl shadow-slate-900/10 tabular-nums">
      {payload[0].name}: {payload[0].value}%
    </div>
  );
}

export default function EngagementDonut({ openRate, clickRate }: DonutProps) {
  const resting = Math.max(0, +(100 - openRate - clickRate).toFixed(1));
  const data = [
    { name: "Opened", value: openRate, color: "#4f46e5" },
    { name: "Clicked", value: clickRate, color: "#10b981" },
    { name: "No engagement", value: resting, color: "#e2e8f0" },
  ];

  return (
    <section
      className="animate-fade-up flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      style={{ animationDelay: "360ms" }}
    >
      <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
        Engagement split
      </h3>
      <p className="mt-0.5 text-sm text-slate-500">Of every 100 delivered emails</p>

      <div className="relative mx-auto mt-2 h-[190px] w-full max-w-[240px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              strokeWidth={0}
              animationDuration={1000}
            >
              {data.map((segment) => (
                <Cell key={segment.name} fill={segment.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {openRate}%
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            open rate
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {data.map((segment) => (
          <li key={segment.name} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="flex-1 font-medium text-slate-600">{segment.name}</span>
            <span className="font-display font-semibold text-slate-900 tabular-nums">
              {segment.value}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
