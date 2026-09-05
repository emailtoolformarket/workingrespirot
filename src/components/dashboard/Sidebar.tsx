import { useEffect, useState } from "react";
import {
  FileText,
  LayoutDashboard,
  Send,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { LogoMark } from "../icons";

interface NavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Campaigns", icon: Send, badge: "3" },
  { label: "Subscribers", icon: Users },
  { label: "Templates", icon: FileText },
  { label: "Settings", icon: Settings },
];

const MONTHLY_LIMIT = 60000;

export default function Sidebar({
  open,
  onClose,
  emailsSent,
}: {
  open: boolean;
  onClose: () => void;
  emailsSent: number;
}) {
  const { push } = useToast();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  const usagePct = Math.min(100, Math.round((emailsSent / MONTHLY_LIMIT) * 100));
  const initials = (user?.full_name ?? "Demo User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleNavigate = (label: string, active?: boolean) => {
    onClose();
    if (!active) {
      push(`${label} ships in the next milestone — this MVP focuses on the dashboard.`, "info");
    }
  };

  return (
    <>
      {/* mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] transform flex-col bg-slate-950 transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />

        {/* brand */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="font-display text-lg leading-tight font-bold tracking-tight text-white">
                Relay
              </p>
              <p className="text-[10px] font-medium tracking-[0.18em] text-slate-500 uppercase">
                Mail console
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* navigation */}
        <nav className="relative flex-1 space-y-1 overflow-y-auto px-4 py-2">
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-slate-600 uppercase">
            Workspace
          </p>
          {NAV_ITEMS.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavigate(item.label, item.active)}
              className={`group flex w-full animate-fade-up items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                item.active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:translate-x-0.5 hover:bg-slate-800/70 hover:text-white"
              }`}
              style={{ animationDelay: `${80 + index * 55}ms` }}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                    item.active
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* plan usage */}
        <div className="relative px-4 pb-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-display text-xs font-semibold text-white">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                {user?.plan ?? "Growth"} plan
              </p>
              <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                {usagePct}% used
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  usagePct > 85 ? "bg-rose-500" : "bg-indigo-500"
                }`}
                style={{ width: mounted ? `${usagePct}%` : "0%" }}
              />
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-300 tabular-nums">
                {emailsSent.toLocaleString("en-US")}
              </span>{" "}
              of {MONTHLY_LIMIT.toLocaleString("en-US")} monthly sends
            </p>
          </div>

          {/* user mini card */}
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 font-display text-xs font-bold text-indigo-300">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
