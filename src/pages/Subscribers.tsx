import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import type { Subscriber } from "../lib/store";
import { useToast } from "../context/ToastContext";
import { ModalShell } from "./Campaigns";

const PAGE_SIZE = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StatusFilter = "all" | "active" | "unsubscribed";

export default function Subscribers() {
  const { push } = useToast();
  const { subscribers, addSubscriber, toggleSubscriber, deleteSubscriber } = useStore();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const active = subscribers.filter((s) => s.status === "active").length;
  const unsubscribed = subscribers.length - active;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((s) => {
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesQuery =
        q === "" || s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [subscribers, statusFilter, query]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPaging = (fn: () => void) => () => {
    fn();
    setPage(1);
  };

  const exportCsv = () => {
    const header = "email,name,status,joined,tags";
    const rows = visible.map((s) =>
      [s.email, `"${s.name}"`, s.status, s.joined, `"${s.tags.join("|")}"`].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relay-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    push(`Exported ${visible.length} subscribers to CSV.`, "success");
  };

  const handleAdd = (email: string, name: string) => {
    const added = addSubscriber(email, name);
    setAddOpen(false);
    if (added) {
      push(`${email} joined your audience. Welcome email queued.`, "success");
    } else {
      push("That email is already on your list.", "warning");
    }
  };

  const handleToggle = (s: Subscriber) => {
    toggleSubscriber(s.id);
    push(
      s.status === "active"
        ? `${s.email} unsubscribed — they'll no longer receive sends.`
        : `${s.email} re-subscribed. Welcome back.`,
      s.status === "active" ? "warning" : "success",
    );
  };

  return (
    <>
      {/* header */}
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-indigo-600">Subscribers</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your audience
          </h1>
          <p className="mt-1 text-slate-500">
            Showing the {subscribers.length} most recent of 14,502 total subscribers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-display text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Add subscriber
          </button>
        </div>
      </div>

      {/* mini stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat icon={<Users className="h-4 w-4" />} label="In this list" value={subscribers.length.toLocaleString("en-US")} tint="bg-indigo-50 text-indigo-600" index={0} />
        <MiniStat icon={<TrendingUp className="h-4 w-4" />} label="Active" value={active.toLocaleString("en-US")} tint="bg-emerald-50 text-emerald-600" index={1} />
        <MiniStat icon={<UserMinus className="h-4 w-4" />} label="Unsubscribed" value={unsubscribed.toLocaleString("en-US")} tint="bg-rose-50 text-rose-500" index={2} />
        <MiniStat icon={<UserPlus className="h-4 w-4" />} label="New this week" value="+328" tint="bg-amber-50 text-amber-600" index={3} />
      </div>

      {/* toolbar */}
      <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "120ms" }}>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {(
            [
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "unsubscribed", label: "Unsubscribed" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={resetPaging(() => setStatusFilter(f.key))}
              className={`rounded-md px-3 py-1.5 font-display text-xs font-semibold transition-all duration-200 ${
                statusFilter === f.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email…"
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm shadow-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          />
        </div>
      </div>

      {/* table */}
      <div className="animate-fade-up mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: "160ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {["Subscriber", "Tags", "Joined", "Status", ""].map((heading, i) => (
                  <th key={heading || `h-${i}`} className={`px-5 py-3 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase ${i > 2 ? "text-right" : ""}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <p className="font-display text-sm font-semibold text-slate-700">No subscribers match</p>
                    <p className="mt-1 text-xs text-slate-400">Try a different search or filter.</p>
                  </td>
                </tr>
              ) : (
                pageRows.map((s) => (
                  <tr key={s.id} className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-indigo-50/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${s.status === "active" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
                          {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{s.name}</p>
                          <p className="truncate text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {s.tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap text-slate-500">{s.joined}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${s.status === "active" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-slate-200"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {s.status === "active" ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleToggle(s)}
                          className={`rounded-lg border p-2 transition-all ${s.status === "active" ? "border-slate-200 text-slate-400 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600" : "border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"}`}
                          aria-label={s.status === "active" ? `Unsubscribe ${s.email}` : `Re-subscribe ${s.email}`}
                          title={s.status === "active" ? "Unsubscribe" : "Re-subscribe"}
                        >
                          {s.status === "active" ? <UserMinus className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteSubscriber(s.id);
                            push(`${s.email} removed from your list.`, "warning");
                          }}
                          className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${s.email}`}
                          title="Delete"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400 tabular-nums">
            Page {safePage} of {pageCount} · {visible.length} shown
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-all enabled:hover:border-indigo-300 enabled:hover:text-indigo-600 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-all enabled:hover:border-indigo-300 enabled:hover:text-indigo-600 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {addOpen && <AddSubscriberModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
    </>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tint,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
  index: number;
}) {
  return (
    <div
      className="animate-fade-up flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
      style={{ animationDelay: `${60 + index * 60}ms` }}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>{icon}</span>
      <div>
        <p className="font-display text-lg leading-tight font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
      </div>
    </div>
  );
}

function AddSubscriberModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (email: string, name: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    onAdd(email, name);
  };

  return (
    <ModalShell title="Add subscriber" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="jane@company.com"
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all focus:ring-4 focus:outline-none ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"}`}
          />
          {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name <span className="font-normal text-slate-400">(optional)</span></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Cooper"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500">
            Add to audience
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
