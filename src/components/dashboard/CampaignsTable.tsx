import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { Campaign, CampaignStatus } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const STATUS_STYLES: Record<CampaignStatus, { label: string; classes: string; dot: string }> = {
  sent: {
    label: "Sent",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  scheduled: {
    label: "Scheduled",
    classes: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  draft: {
    label: "Draft",
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export default function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const { push } = useToast();

  return (
    <section
      className="animate-fade-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      style={{ animationDelay: "440ms" }}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-slate-900">
            Recent campaigns
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">Performance of your latest sends</p>
        </div>
        <button
          type="button"
          onClick={() => push("The full campaign archive ships in the next milestone.", "info")}
          className="group flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase sm:px-6">
                Campaign
              </th>
              <th className="px-4 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                Sent
              </th>
              <th className="px-4 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                Open rate
              </th>
              <th className="px-4 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                Date
              </th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const status = STATUS_STYLES[campaign.status];
              return (
                <tr
                  key={campaign.name}
                  className="group cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-indigo-50/40"
                  onClick={() =>
                    push(`Opening “${campaign.name}” — campaign detail ships next milestone.`, "info")
                  }
                >
                  <td className="px-5 py-4 sm:px-6">
                    <p className="font-display text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
                      {campaign.name}
                    </p>
                    <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400">
                      {campaign.subject}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${status.classes}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-display text-sm font-semibold text-slate-800 tabular-nums">
                    {campaign.sent_count > 0
                      ? campaign.sent_count.toLocaleString("en-US")
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:w-24">
                        <div
                          className="animate-grow-bar h-full rounded-full bg-indigo-500"
                          style={
                            {
                              "--w": `${Math.min(100, campaign.open_rate * 2.5)}%`,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                      <span className="w-12 text-sm font-semibold text-slate-700 tabular-nums">
                        {campaign.open_rate > 0 ? `${campaign.open_rate}%` : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-500">
                    {campaign.sent_at}
                  </td>
                  <td className="px-2 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
