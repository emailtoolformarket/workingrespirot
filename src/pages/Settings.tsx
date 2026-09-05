import { useState } from "react";
import type { FormEvent } from "react";
import {
  Bell,
  Check,
  Copy,
  KeyRound,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../lib/store";
import type { WorkspaceSettings } from "../lib/store";
import { useToast } from "../context/ToastContext";
import { ModalShell } from "./Campaigns";

const NOTIFICATION_ROWS: {
  key: keyof WorkspaceSettings["notifications"];
  title: string;
  description: string;
}[] = [
  { key: "campaignSent", title: "Campaign sent", description: "When a campaign finishes sending to your audience." },
  { key: "weeklyDigest", title: "Weekly digest", description: "A Monday summary of opens, clicks and list growth." },
  { key: "newSubscriber", title: "New subscriber", description: "Real-time pings for every signup (can get noisy)." },
  { key: "deliverabilityAlerts", title: "Deliverability alerts", description: "Bounce-rate spikes and blocklist warnings." },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const { settings, updateSettings, setNotification, resetDemoData } = useStore();

  const [profileName, setProfileName] = useState(settings.profileName);
  const [resetOpen, setResetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    updateSettings({ profileName: profileName.trim() });
    push("Profile saved — your display name is updated everywhere.", "success");
  };

  const generateKey = () => {
    const random = Array.from({ length: 24 }, () =>
      "abcdef0123456789"[Math.floor(Math.random() * 16)],
    ).join("");
    updateSettings({ apiKey: `rl_live_${random}` });
    push("New API key generated. The old one stops working immediately.", "warning");
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(settings.apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      push("API key copied to clipboard.", "success");
    } catch {
      push("Clipboard is blocked in this browser — select the key manually.", "warning");
    }
  };

  return (
    <>
      <div className="animate-fade-up">
        <p className="text-sm font-semibold tracking-wide text-indigo-600">Settings</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Workspace preferences
        </h1>
        <p className="mt-1 text-slate-500">Changes are saved to this browser and survive reloads.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* profile */}
        <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: "80ms" }}>
          <SectionTitle icon={<UserRound className="h-4 w-4" />} title="Profile" hint="How you appear across the console" />
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <div>
              <label htmlFor="display-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Display name
              </label>
              <input
                id="display-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={user?.full_name ?? "Your name"}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">Leave blank to use your account name ({user?.full_name}).</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Login email</label>
              <input
                value={user?.email ?? ""}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-400"
              />
              <p className="mt-1 text-[11px] text-slate-400">Managed by auth — edit via your identity provider.</p>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500">
                <Save className="h-4 w-4" />
                Save profile
              </button>
            </div>
          </form>
        </section>

        {/* notifications */}
        <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: "140ms" }}>
          <SectionTitle icon={<Bell className="h-4 w-4" />} title="Notifications" hint="Email alerts about workspace activity" />
          <ul className="mt-2 divide-y divide-slate-100">
            {NOTIFICATION_ROWS.map((row) => {
              const enabled = settings.notifications[row.key];
              return (
                <li key={row.key} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{row.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{row.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => {
                      setNotification(row.key, !enabled);
                      push(`${row.title} ${enabled ? "disabled" : "enabled"}.`, enabled ? "warning" : "success");
                    }}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${enabled ? "bg-indigo-600" : "bg-slate-200"}`}
                    aria-label={`Toggle ${row.title}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-5" : ""}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* api key */}
        <section className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: "200ms" }}>
          <SectionTitle icon={<KeyRound className="h-4 w-4" />} title="API access" hint="Send programmatically via POST /api/send" />
          <div className="mt-4 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-600">
              {settings.apiKey.slice(0, 12)}••••••••••••••••
            </code>
            <button
              type="button"
              onClick={copyKey}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700"}`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Scoped to this workspace · rate limit 60 req/min
            </p>
            <button
              type="button"
              onClick={generateKey}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rotate key
            </button>
          </div>
        </section>

        {/* data + danger zone */}
        <section className="animate-fade-up rounded-xl border border-rose-200/70 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: "260ms" }}>
          <SectionTitle icon={<RefreshCw className="h-4 w-4" />} title="Workspace data" hint="Local demo data & session" danger />
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Reset demo data</p>
                <p className="mt-0.5 text-xs text-slate-400">Restore seed campaigns, subscribers and templates.</p>
              </div>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Reset
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Log out</p>
                <p className="mt-0.5 text-xs text-slate-400">Clears the JWT from this browser.</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-600/25 transition-all hover:-translate-y-0.5 hover:bg-rose-500"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          </div>
        </section>
      </div>

      {resetOpen && (
        <ModalShell title="Reset workspace data?" onClose={() => setResetOpen(false)}>
          <p className="text-sm leading-relaxed text-slate-500">
            Your custom campaigns, subscribers and templates will be replaced with the original demo
            dataset. Settings are kept. This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setResetOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
              Keep my data
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                setResetOpen(false);
                push("Workspace data restored to the demo dataset.", "success");
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Reset data
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
}

function SectionTitle({
  icon,
  title,
  hint,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${danger ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-600"}`}>
        {icon}
      </span>
      <div>
        <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
    </div>
  );
}
