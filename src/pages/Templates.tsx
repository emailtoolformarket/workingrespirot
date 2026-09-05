import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, FilePlus2, PenLine, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import type { Template } from "../lib/store";
import { useToast } from "../context/ToastContext";
import { ModalShell } from "./Campaigns";

const ACCENTS: Record<Template["accent"], { header: string; button: string; ring: string; swatch: string }> = {
  indigo: { header: "bg-indigo-600", button: "bg-indigo-600", ring: "ring-indigo-200", swatch: "bg-indigo-600" },
  emerald: { header: "bg-emerald-600", button: "bg-emerald-600", ring: "ring-emerald-200", swatch: "bg-emerald-600" },
  amber: { header: "bg-amber-500", button: "bg-amber-500", ring: "ring-amber-200", swatch: "bg-amber-500" },
  sky: { header: "bg-sky-600", button: "bg-sky-600", ring: "ring-sky-200", swatch: "bg-sky-600" },
  rose: { header: "bg-rose-500", button: "bg-rose-500", ring: "ring-rose-200", swatch: "bg-rose-500" },
  slate: { header: "bg-slate-700", button: "bg-slate-700", ring: "ring-slate-200", swatch: "bg-slate-700" },
};

export default function Templates() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { templates, duplicateTemplate, deleteTemplate, addTemplate } = useStore();

  const [preview, setPreview] = useState<Template | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const useTemplate = (template: Template) => {
    navigate("/campaigns", { state: { create: true, template: { name: template.name } } });
  };

  return (
    <>
      {/* header */}
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-indigo-600">Templates</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Start from something proven
          </h1>
          <p className="mt-1 text-slate-500">
            {templates.length} templates · reuse them across unlimited campaigns.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-display text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          <FilePlus2 className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
          New template
        </button>
      </div>

      {/* grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template, index) => {
          const accent = ACCENTS[template.accent];
          return (
            <article
              key={template.id}
              className="group animate-fade-up flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5"
              style={{ animationDelay: `${100 + index * 70}ms` }}
            >
              {/* email mockup thumbnail */}
              <button
                type="button"
                onClick={() => setPreview(template)}
                className="relative block w-full cursor-pointer overflow-hidden border-b border-slate-100 bg-slate-50 p-4 text-left"
                aria-label={`Preview ${template.name}`}
              >
                <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
                  <div className={`${accent.header} h-9 px-3 py-2`}>
                    <div className="h-1.5 w-12 rounded-full bg-white/70" />
                    <div className="mt-1 h-1 w-20 rounded-full bg-white/40" />
                  </div>
                  <div className="space-y-1.5 px-3 py-3">
                    <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-1.5 w-full rounded-full bg-slate-100" />
                    <div className="h-1.5 w-5/6 rounded-full bg-slate-100" />
                    <div className={`mt-2 h-5 w-16 rounded ${accent.button} opacity-90`} />
                    <div className="mt-2 h-1 w-2/3 rounded-full bg-slate-100" />
                  </div>
                </div>
                <span className="absolute right-3 bottom-3 rounded-md bg-white/90 px-2 py-1 font-display text-[10px] font-bold text-slate-500 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
                  Click to preview
                </span>
              </button>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">{template.name}</h3>
                    <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      {template.category}
                    </p>
                  </div>
                  <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ring-4 ${accent.swatch} ${accent.ring}`} />
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    Used {template.uses}× · {template.updated}
                  </span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => useTemplate(template)}
                    className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 font-display text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
                  >
                    Use template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      duplicateTemplate(template.id);
                      push(`“${template.name}” duplicated.`, "success");
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                    aria-label={`Duplicate ${template.name}`}
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(template)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${template.name}`}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {preview && <PreviewModal template={preview} onClose={() => setPreview(null)} onUse={() => { setPreview(null); useTemplate(preview); }} />}
      {pendingDelete && (
        <ModalShell title={`Delete “${pendingDelete.name}”?`} onClose={() => setPendingDelete(null)}>
          <p className="text-sm leading-relaxed text-slate-500">
            Campaigns already created from this template keep their content. The template itself is
            removed from your library.
          </p>
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setPendingDelete(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteTemplate(pendingDelete.id);
                push(`“${pendingDelete.name}” deleted.`, "warning");
                setPendingDelete(null);
              }}
              className="rounded-lg bg-rose-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-rose-600/25 transition-all hover:-translate-y-0.5 hover:bg-rose-500"
            >
              Delete template
            </button>
          </div>
        </ModalShell>
      )}
      {createOpen && <CreateTemplateModal onClose={() => setCreateOpen(false)} onCreate={(input) => { addTemplate(input); setCreateOpen(false); push(`Template “${input.name}” added to your library.`, "success"); }} />}
    </>
  );
}

function PreviewModal({
  template,
  onClose,
  onUse,
}: {
  template: Template;
  onClose: () => void;
  onUse: () => void;
}) {
  const accent = ACCENTS[template.accent];
  return (
    <ModalShell title={`${template.name} — preview`} onClose={onClose}>
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <div className={`${accent.header} px-6 py-5`}>
          <p className="font-display text-lg font-bold text-white">Relay</p>
          <p className="mt-0.5 text-xs text-white/70">{template.category} template</p>
        </div>
        <div className="space-y-2.5 bg-white px-6 py-6">
          <div className="h-2 w-2/3 rounded-full bg-slate-200" />
          <div className="h-2 w-full rounded-full bg-slate-100" />
          <div className="h-2 w-5/6 rounded-full bg-slate-100" />
          <div className="h-2 w-3/4 rounded-full bg-slate-100" />
          <div className={`mt-3 inline-block h-8 w-28 rounded-lg ${accent.button}`} />
          <div className="pt-2">
            <div className="h-2 w-1/2 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
          <p className="text-[11px] text-slate-400">Unsubscribe · Preferences · View in browser</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-500">{template.description}</p>
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          Close
        </button>
        <button type="button" onClick={onUse} className="rounded-lg bg-indigo-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500">
          Use this template
        </button>
      </div>
    </ModalShell>
  );
}

function CreateTemplateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: { name: string; category: string; accent: Template["accent"] }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Newsletter");
  const [accent, setAccent] = useState<Template["accent"]>("indigo");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 3) {
      setError("Template names need at least 3 characters.");
      return;
    }
    onCreate({ name: name.trim(), category, accent });
  };

  return (
    <ModalShell title="New template" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Template name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Flash Sale Banner"
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all focus:ring-4 focus:outline-none ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"}`}
          />
          {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
          >
            {["Newsletter", "Announcement", "Retention", "Onboarding", "Promotion", "Transactional"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Accent color</label>
          <div className="flex gap-2.5">
            {(Object.keys(ACCENTS) as Template["accent"][]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAccent(key)}
                className={`h-9 w-9 rounded-full transition-all duration-200 ${ACCENTS[key].swatch} ${accent === key ? "scale-110 ring-4 " + ACCENTS[key].ring : "opacity-60 hover:opacity-100"}`}
                aria-label={`Accent ${key}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <span className="mr-auto flex items-center gap-1.5 text-[11px] text-slate-400">
            <PenLine className="h-3.5 w-3.5" />
            Layout editor ships next milestone
          </span>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 font-display text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500">
            Create template
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
