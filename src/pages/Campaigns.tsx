import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarClock,
  Eye,
  Inbox,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import type { CampaignStatus, StoreCampaign } from "../lib/store";
import { useToast } from "../context/ToastContext";

type Filter = "all" | CampaignStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Drafts" },
];

const STATUS_STYLES: Record<CampaignStatus, string> = {
  sent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  scheduled: "bg-amber-50 text-amber-700 ring-amber-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
};

interface CreatePayload {
  name: string;
  subject: string;
  content: string;
  status: CampaignStatus;
}

export default function Campaigns() {
  const location = useLocation();
  const { push } = useToast();
  const { campaigns, addCampaign, deleteCampaign, sendCampaign } = useStore();

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitial, setCreateInitial] = useState<Partial<CreatePayload>>({});
  const [detail, setDetail] = useState<StoreCampaign | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StoreCampaign | null>(null);

  // Opening from Dashboard ("New campaign") or Templates ("Use template").
  useEffect(() => {
    const state = location.state as { create?: boolean; template?: { name: string } } | null;
    if (state?.create) {
      setCreateInitial(
        state.template
          ? {
              subject: `${state.template.name} — {{first_name}}, a quick note`,
              content: "Hey {{first_name}},\n\n…\n\n— The Relay team",
            }
          : {},
      );
      setCreateOpen(true);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = { all: campaigns.length, sent: 0, scheduled: 0, draft: 0 };
    campaigns.forEach((c) => {
      base[c.status] += 1;
    });
    return base;
  }, [campaigns]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchesFilter = filter === "all" || c.status === filter;
      const matchesQuery =
        q === "" || c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [campaigns, filter, query]);

  const handleCreate = (payload: CreatePayload) => {
    addCampaign(payload);
    setCreateOpen(false);
    push(
      payload.status === "scheduled"
        ? `“${payload.name}” scheduled — it will go out to 14,502 subscribers.`
        : `Draft “${payload.name}” saved to your workspace.`,
      "success",
    );
  };

  const handleSend = (campaign: StoreCampaign) => {
    sendCampaign(campaign.id);
    push(`“${campaign.name}” is sending to 14,502 subscribers now.`, "success");
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteCampaign(pendingDelete.id);
    push(`“${pendingDelete.name}” was deleted.`, "warning");
    setPendingDelete(null);
    if (detail?.id === pendingDelete.id) setDetail(null);
  };

  return (
    <>
      {/* header */}
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-indigo-600">Campaigns</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Every send, in one place
          </h1>
          <p className="mt-1 text-slate-500">
            {campaigns.length} campaigns · {counts.scheduled} queued · {counts.draft} drafts
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateInitial({});
            setCreateOpen(true);
          }}
          className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          New campaign
        </button>
      </div>

      {/* toolbar */}
      <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "80ms" }}>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-display text-xs font-semibold transition-all duration-200 ${
                filter === f.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f.label}
              <span className={`tabular-nums ${filter === f.key ? "text-indigo-200" : "text-slate-400"}`}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns…"
            className="w-64 rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm shadow-sm placeholder-slate-400 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          />
        </div>
      </div>

      {/* list */}
      <div className="mt-5 space-y-3">
        {visible.length === 0 ? (
          <EmptyState hasQuery={query.trim() !== ""} onClear={() => { setQuery(""); setFilter("all"); }} />
        ) : (
          visible.map((campaign, index) => (
            <article
              key={campaign.id}
              className="group animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              style={{ animationDelay: `${120 + index * 60}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-base font-bold text-slate-900">{campaign.name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[campaign.status]}`}>
                      {campaign.status === "sent" ? "Sent" : campaign.status === "scheduled" ? "Scheduled" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {campaign.subject}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                      {campaign.sent_at}
                    </span>
                    <span className="tabular-nums">
                      <span className="font-semibold text-slate-700">
                        {campaign.sent_count > 0 ? campaign.sent_count.toLocaleString("en-US") : "—"}
                      </span>{" "}
                      sent
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="animate-grow-bar block h-full rounded-full bg-indigo-500"
                          style={{ "--w": `${Math.min(100, campaign.open_rate * 2.5)}%` } as React.CSSProperties}
                        />
                      </span>
                      <span className="font-semibold text-slate-700">
                        {campaign.open_rate > 0 ? `${campaign.open_rate}% opens` : "no opens yet"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetail(campaign)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  {campaign.status !== "sent" && (
                    <button
                      type="button"
                      onClick={() => handleSend(campaign)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {campaign.status === "scheduled" ? "Send now" : "Send"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingDelete(campaign)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${campaign.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {createOpen && (
        <CreateCampaignModal
          initial={createInitial}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}
      {detail && <DetailModal campaign={detail} onClose={() => setDetail(null)} />}
      {pendingDelete && (
        <ConfirmModal
          title={`Delete “${pendingDelete.name}”?`}
          body="This removes the campaign from your workspace. Sending history in the dashboard is unaffected."
          confirmLabel="Delete campaign"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------- components */

function EmptyState({ hasQuery, onClear }: { hasQuery: boolean; onClear: () => void }) {
  return (
    <div className="animate-fade-up rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
        <Inbox className="h-7 w-7 text-indigo-500" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
        {hasQuery ? "No campaigns match" : "Nothing here yet"}
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        {hasQuery
          ? "Try a different search term or clear the filters."
          : "Create your first campaign and it will appear here, saved to your workspace."}
      </p>
      {hasQuery && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-indigo-300 hover:text-indigo-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function CreateCampaignModal({
  initial,
  onClose,
  onCreate,
}: {
  initial: Partial<CreatePayload>;
  onClose: () => void;
  onCreate: (payload: CreatePayload) => void;
}) {
  const [name, setName] = useState(initial.name ?? "");
  const [subject, setSubject] = useState(initial.subject ?? "");
  const [content, setContent] = useState(
    initial.content ?? "Hey {{first_name}},\n\n…\n\n— The Relay team",
  );
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [errors, setErrors] = useState<{ name?: string; subject?: string }>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: { name?: string; subject?: string } = {};
    if (name.trim().length < 3) next.name = "Give it a name of at least 3 characters.";
    if (subject.trim().length < 5) next.subject = "Subjects need at least 5 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onCreate({ name: name.trim(), subject: subject.trim(), content, status });
  };

  return (
    <ModalShell title="New campaign" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <LabeledInput
          label="Campaign name"
          value={name}
          onChange={setName}
          placeholder="March Newsletter"
          error={errors.name}
        />
        <LabeledInput
          label="Subject line"
          value={subject}
          onChange={setSubject}
          placeholder="What lands in the inbox"
          error={errors.subject}
        />
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Body</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs leading-relaxed text-slate-700 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Merge fields like {"{{first_name}}"} are substituted per subscriber at send time.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Save as</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "draft", label: "Draft", hint: "Keep editing later" },
                { key: "scheduled", label: "Scheduled", hint: "Queued for the next window" },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setStatus(option.key)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-all duration-200 ${
                  status === option.key
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className={`block font-display text-sm font-semibold ${status === option.key ? "text-indigo-700" : "text-slate-700"}`}>
                  {option.label}
                </span>
                <span className="block text-[11px] text-slate-400">{option.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500">
            Create campaign
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DetailModal({ campaign, onClose }: { campaign: StoreCampaign; onClose: () => void }) {
  return (
    <ModalShell title={campaign.name} onClose={onClose}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${STATUS_STYLES[campaign.status]}`}>
          {campaign.status}
        </span>
        <span className="text-xs text-slate-400">Subject: {campaign.subject}</span>
      </div>
      {/* email-style preview */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 truncate text-[11px] text-slate-400">
            Inbox — {campaign.subject}
          </span>
        </div>
        <div className="bg-white px-5 py-5">
          <div className="mb-4 h-2 w-24 rounded bg-indigo-600" />
          {campaign.content.split("\n").map((line, i) =>
            line.startsWith("→") ? (
              <p key={i} className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-display text-xs font-semibold text-white">
                {line.replace("→", "").trim()}
              </p>
            ) : (
              <p key={i} className={`text-sm leading-relaxed ${line.trim() === "" ? "h-2" : "text-slate-600"}`}>
                {line}
              </p>
            ),
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          Close
        </button>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ModalShell title={title} onClose={onCancel}>
      <p className="text-sm leading-relaxed text-slate-500">{body}</p>
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-rose-600/25 transition-all hover:-translate-y-0.5 hover:bg-rose-500">
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="animate-fade-in absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-fade-up relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close dialog">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all focus:ring-4 focus:outline-none ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"
        }`}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
