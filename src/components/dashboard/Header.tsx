import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const NOTIFICATIONS = [
  { icon: CheckCircle2, tint: "text-emerald-500 bg-emerald-50", text: "“Spring Product Launch” finished sending", time: "12m ago" },
  { icon: UserPlus, tint: "text-indigo-500 bg-indigo-50", text: "486 new subscribers this week", time: "1h ago" },
  { icon: BarChart3, tint: "text-amber-500 bg-amber-50", text: "Your daily engagement digest is ready", time: "3h ago" },
];

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const bell = usePopover();
  const profile = usePopover();

  const initials = (user?.full_name ?? "Demo User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSearch = () => {
    push("Global search ships in the next milestone — try the demo data for now.", "info");
  };

  const handleLogout = () => {
    profile.setOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden font-display font-semibold text-slate-400 sm:inline">Relay</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="font-display font-semibold text-slate-900">Overview</span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* search */}
          <button
            type="button"
            onClick={handleSearch}
            className="group hidden w-64 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-400 transition-all duration-200 hover:border-slate-300 hover:bg-white md:flex"
          >
            <Search className="h-4 w-4 transition-colors group-hover:text-indigo-500" />
            <span className="flex-1 text-left">Search campaigns…</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* notifications */}
          <div className="relative" ref={bell.ref}>
            <button
              type="button"
              onClick={() => bell.setOpen((v) => !v)}
              className={`relative rounded-lg p-2 transition-colors ${
                bell.open ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {bell.open && (
              <div className="animate-fade-up absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="font-display text-sm font-semibold text-slate-900">Notifications</p>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                    {NOTIFICATIONS.length} new
                  </span>
                </div>
                <ul>
                  {NOTIFICATIONS.map((notification) => (
                    <li key={notification.text}>
                      <button
                        type="button"
                        onClick={() => {
                          bell.setOpen(false);
                          push("Notification marked as read.", "success");
                        }}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notification.tint}`}>
                          <notification.icon className="h-4 w-4" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm leading-snug font-medium text-slate-700">
                            {notification.text}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-400">{notification.time}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* profile dropdown */}
          <div className="relative" ref={profile.ref}>
            <button
              type="button"
              onClick={() => profile.setOpen((v) => !v)}
              className={`flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors ${
                profile.open ? "bg-slate-100" : "hover:bg-slate-100"
              }`}
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-display text-xs font-bold text-white">
                {initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm leading-tight font-semibold text-slate-900">
                  {user?.full_name}
                </span>
                <span className="block text-[11px] leading-tight text-slate-400">{user?.plan} plan</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  profile.open ? "rotate-180" : ""
                }`}
              />
            </button>

            {profile.open && (
              <div className="animate-fade-up absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-4 py-3.5">
                  <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  <span className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-indigo-600 uppercase">
                    {user?.plan} plan
                  </span>
                </div>
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      profile.setOpen(false);
                      push("Profile settings ship in the next milestone.", "info");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                    </span>
                    Profile settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-50 text-rose-500">
                      <LogOut className="h-3.5 w-3.5" />
                    </span>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
