import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MailOpen, MousePointerClick, Plus, Send, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardStats } from "../lib/api";
import type { DashboardStats } from "../lib/api";
import StatCard from "../components/dashboard/StatCard";
import EngagementChart from "../components/dashboard/EngagementChart";
import EngagementDonut from "../components/dashboard/EngagementDonut";
import CampaignsTable from "../components/dashboard/CampaignsTable";

function greetingFor(hour: number): string {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchDashboardStats(token));
    } catch {
      setError("We couldn't load your dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const firstName = (user?.full_name ?? "there").split(" ")[0];

  if (error) {
    return (
      <div className="animate-fade-up mx-auto mt-16 max-w-md rounded-xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold text-slate-900">{error}</h2>
        <p className="mt-1.5 text-sm text-slate-500">Check your connection to the API, then try again.</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 font-display text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && !stats) return <DashboardSkeleton />;
  if (!stats) return null;

  return (
    <>
      {/* greeting */}
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-indigo-600">{today}</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greetingFor(new Date().getHours())}, {firstName}.
          </h1>
          <p className="mt-1 text-slate-500">Here's how your audience engaged this week.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/campaigns", { state: { create: true } })}
          className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:translate-y-0"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          New campaign
        </button>
      </div>

      {/* metric cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total subscribers" value={stats.total_subscribers.toLocaleString("en-US")}
          icon={<Users className="h-5 w-5" />} delta={{ label: "+3.8% vs last mo.", positive: true }}
          spark={[11200, 11800, 12400, 12100, 13200, 13900, stats.total_subscribers]} accent="indigo" />
        <StatCard index={1} label="Emails sent this month" value={stats.emails_sent_this_month.toLocaleString("en-US")}
          icon={<Send className="h-5 w-5" />} delta={{ label: "+12.4% vs last mo.", positive: true }}
          spark={[28400, 31200, 33800, 30100, 38400, 41900, stats.emails_sent_this_month]} accent="sky" />
        <StatCard index={2} label="Average open rate" value={`${stats.average_open_rate}%`}
          icon={<MailOpen className="h-5 w-5" />} delta={{ label: "-1.2 pts", positive: false }}
          spark={[26.1, 25.4, 25.8, 24.9, 25.2, 24.1, stats.average_open_rate]} accent="amber" />
        <StatCard index={3} label="Average click rate" value={`${stats.average_click_rate}%`}
          icon={<MousePointerClick className="h-5 w-5" />} delta={{ label: "+0.4 pts", positive: true }}
          spark={[2.7, 2.9, 2.8, 3.0, 3.1, 3.0, stats.average_click_rate]} accent="emerald" />
      </div>

      {/* charts */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <EngagementChart data={stats.engagement_chart} />
        <EngagementDonut openRate={stats.average_open_rate} clickRate={stats.average_click_rate} />
      </div>

      {/* campaigns */}
      <div className="mt-6">
        <CampaignsTable campaigns={stats.recent_campaigns} />
      </div>

      <p className="animate-fade-in mt-8 pb-2 text-center text-xs text-slate-400" style={{ animationDelay: "600ms" }}>
        Relay MVP · GET /api/dashboard/stats · workspace pages persist locally
      </p>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="animate-fade-in space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-72 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="h-[400px] animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-2" />
        <div className="h-[400px] animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
