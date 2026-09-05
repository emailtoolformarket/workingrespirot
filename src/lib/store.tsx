/**
 * Client-side workspace store for Relay.
 *
 * Campaigns, subscribers, templates and settings created inside the app are
 * persisted to localStorage so the workspace survives reloads. This mirrors
 * what the FastAPI models in `backend/models.py` will own once the CRUD
 * endpoints land; the shapes are intentionally kept close.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

/* ---------------------------------------------------------------- types */

export type CampaignStatus = "sent" | "scheduled" | "draft";

export interface StoreCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: CampaignStatus;
  sent_count: number;
  open_rate: number;
  sent_at: string;
  created_at: number;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: "active" | "unsubscribed";
  joined: string;
  tags: string[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  accent: "indigo" | "emerald" | "amber" | "sky" | "rose" | "slate";
  description: string;
  uses: number;
  updated: string;
}

export interface WorkspaceSettings {
  profileName: string;
  apiKey: string;
  notifications: {
    campaignSent: boolean;
    weeklyDigest: boolean;
    newSubscriber: boolean;
    deliverabilityAlerts: boolean;
  };
}

interface StoreValue {
  campaigns: StoreCampaign[];
  subscribers: Subscriber[];
  templates: Template[];
  settings: WorkspaceSettings;
  addCampaign: (input: { name: string; subject: string; content: string; status: CampaignStatus }) => void;
  deleteCampaign: (id: string) => void;
  sendCampaign: (id: string) => void;
  addSubscriber: (email: string, name: string) => boolean;
  toggleSubscriber: (id: string) => void;
  deleteSubscriber: (id: string) => void;
  addTemplate: (input: { name: string; category: string; accent: Template["accent"] }) => void;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  setNotification: (key: keyof WorkspaceSettings["notifications"], value: boolean) => void;
  resetDemoData: () => void;
}

/* ------------------------------------------------------------ seed data */

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const SEED_CAMPAIGNS: StoreCampaign[] = [
  {
    id: "camp-1",
    name: "Spring Product Launch",
    subject: "Something new just landed 🌱",
    content:
      "Hey {{first_name}},\n\nOur spring lineup is finally here — three new automations, a redesigned editor, and send-time optimization powered by your audience's real engagement windows.\n\nEarly adopters saw open rates climb by an average of 6 points in the first two weeks.\n\n→ Explore what's new\n\nCheers,\nThe Relay team",
    status: "sent",
    sent_count: 12480,
    open_rate: 27.4,
    sent_at: "Feb 12, 2026",
    created_at: Date.now() - 6 * 86400000,
  },
  {
    id: "camp-2",
    name: "Weekly Newsletter #42",
    subject: "5 growth loops worth stealing",
    content:
      "Hey {{first_name}},\n\nThis week: the referral loop that took Looper to 40k users, a teardown of Linear's onboarding emails, and the subject-line formula that keeps beating A/B tests.\n\nFive minutes, five takeaways.\n\n→ Read issue #42",
    status: "sent",
    sent_count: 14102,
    open_rate: 22.1,
    sent_at: "Feb 9, 2026",
    created_at: Date.now() - 9 * 86400000,
  },
  {
    id: "camp-3",
    name: "Re-engagement Drip",
    subject: "We miss you — here's 20% off",
    content:
      "Hey {{first_name}},\n\nIt's been a while since your last open, so here's the short version of what you missed — plus 20% off your next three months, no code needed.\n\n→ Claim the discount\n\nValid until Friday.",
    status: "scheduled",
    sent_count: 0,
    open_rate: 0,
    sent_at: "Feb 18, 2026",
    created_at: Date.now() - 2 * 86400000,
  },
  {
    id: "camp-4",
    name: "Feature Spotlight: Automations",
    subject: "Put your follow-ups on autopilot",
    content:
      "Hey {{first_name}},\n\nAutomations quietly handle the emails you'd otherwise forget: welcome series, trial nudges, win-backs.\n\nHere's the 10-minute setup most teams ship on day one.\n\n→ Watch the walkthrough",
    status: "draft",
    sent_count: 0,
    open_rate: 0,
    sent_at: "—",
    created_at: Date.now() - 86400000,
  },
];

const SEED_SUBSCRIBERS: Subscriber[] = [
  { id: "sub-1", email: "maya.chen@brightloop.io", name: "Maya Chen", status: "active", joined: "Feb 11, 2026", tags: ["power-user", "trial"] },
  { id: "sub-2", email: "jonas@nordwind.dev", name: "Jonas Berg", status: "active", joined: "Feb 10, 2026", tags: ["newsletter"] },
  { id: "sub-3", email: "priya.raman@hexlane.com", name: "Priya Raman", status: "active", joined: "Feb 10, 2026", tags: ["power-user"] },
  { id: "sub-4", email: "tom.okeefe@fjordworks.co", name: "Tom O'Keefe", status: "unsubscribed", joined: "Feb 8, 2026", tags: ["newsletter"] },
  { id: "sub-5", email: "alicia@moonharbor.studio", name: "Alicia Fontaine", status: "active", joined: "Feb 7, 2026", tags: ["designer"] },
  { id: "sub-6", email: "dev.patel@stackpine.io", name: "Dev Patel", status: "active", joined: "Feb 6, 2026", tags: ["trial"] },
  { id: "sub-7", email: "sofia.marino@atelier9.eu", name: "Sofia Marino", status: "active", joined: "Feb 5, 2026", tags: ["newsletter", "designer"] },
  { id: "sub-8", email: "k.watanabe@kodo.jp", name: "Kenji Watanabe", status: "unsubscribed", joined: "Feb 4, 2026", tags: ["newsletter"] },
  { id: "sub-9", email: "grace.lindqvist@polarpost.se", name: "Grace Lindqvist", status: "active", joined: "Feb 3, 2026", tags: ["power-user"] },
  { id: "sub-10", email: "omar.haddad@cedarlabs.co", name: "Omar Haddad", status: "active", joined: "Feb 2, 2026", tags: ["trial"] },
  { id: "sub-11", email: "elena@roverandfield.com", name: "Elena Petrova", status: "active", joined: "Jan 30, 2026", tags: ["newsletter"] },
  { id: "sub-12", email: "marcus.webb@driftmail.app", name: "Marcus Webb", status: "active", joined: "Jan 29, 2026", tags: ["power-user", "trial"] },
  { id: "sub-13", email: "inha.seo@paperplane.kr", name: "Inha Seo", status: "unsubscribed", joined: "Jan 27, 2026", tags: ["newsletter"] },
  { id: "sub-14", email: "lucas.moreau@voilamail.fr", name: "Lucas Moreau", status: "active", joined: "Jan 25, 2026", tags: ["designer"] },
  { id: "sub-15", email: "tania@bracketstudio.mx", name: "Tania Ruiz", status: "active", joined: "Jan 23, 2026", tags: ["newsletter"] },
  { id: "sub-16", email: "sam.okafor@lumenbase.ng", name: "Sam Okafor", status: "active", joined: "Jan 21, 2026", tags: ["trial"] },
];

const SEED_TEMPLATES: Template[] = [
  { id: "tpl-1", name: "Product Launch", category: "Announcement", accent: "indigo", description: "Bold hero, single CTA, social proof strip. Built for launch-day spikes.", uses: 18, updated: "Feb 11, 2026" },
  { id: "tpl-2", name: "Weekly Digest", category: "Newsletter", accent: "sky", description: "Three-story layout with generous whitespace and a plain-text fallback.", uses: 42, updated: "Feb 9, 2026" },
  { id: "tpl-3", name: "Win-back Offer", category: "Retention", accent: "amber", description: "Urgency bar, discount code block, one-tap re-subscribe button.", uses: 7, updated: "Feb 6, 2026" },
  { id: "tpl-4", name: "Welcome Series", category: "Onboarding", accent: "emerald", description: "Three-part drip: hello, quick win, feature map. Tagged merge fields.", uses: 31, updated: "Feb 2, 2026" },
  { id: "tpl-5", name: "Event Invite", category: "Promotion", accent: "rose", description: "Calendar-ready date block, speaker cards, RSVP button with UTM.", uses: 12, updated: "Jan 28, 2026" },
  { id: "tpl-6", name: "Plain-text Note", category: "Transactional", accent: "slate", description: "Looks like it came from a person. Perfect for founder-led sends.", uses: 25, updated: "Jan 24, 2026" },
];

const DEFAULT_SETTINGS: WorkspaceSettings = {
  profileName: "",
  apiKey: "rl_live_" + "9f27c41b8e5d4aa6",
  notifications: {
    campaignSent: true,
    weeklyDigest: true,
    newSubscriber: false,
    deliverabilityAlerts: true,
  },
};

/* ---------------------------------------------------------- persistence */

const KEYS = {
  campaigns: "relay.store.v1.campaigns",
  subscribers: "relay.store.v1.subscribers",
  templates: "relay.store.v1.templates",
  settings: "relay.store.v1.settings",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — app keeps working in-memory */
  }
}

/* ------------------------------------------------------------- provider */

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<StoreCampaign[]>(() =>
    load(KEYS.campaigns, SEED_CAMPAIGNS),
  );
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() =>
    load(KEYS.subscribers, SEED_SUBSCRIBERS),
  );
  const [templates, setTemplates] = useState<Template[]>(() =>
    load(KEYS.templates, SEED_TEMPLATES),
  );
  const [settings, setSettings] = useState<WorkspaceSettings>(() =>
    load(KEYS.settings, DEFAULT_SETTINGS),
  );

  useEffect(() => save(KEYS.campaigns, campaigns), [campaigns]);
  useEffect(() => save(KEYS.subscribers, subscribers), [subscribers]);
  useEffect(() => save(KEYS.templates, templates), [templates]);
  useEffect(() => save(KEYS.settings, settings), [settings]);

  const addCampaign: StoreValue["addCampaign"] = useCallback((input) => {
    setCampaigns((prev) => [
      {
        id: uid(),
        name: input.name,
        subject: input.subject,
        content: input.content,
        status: input.status,
        sent_count: 0,
        open_rate: 0,
        sent_at: input.status === "scheduled" ? today() : "—",
        created_at: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const deleteCampaign = useCallback(
    (id: string) => setCampaigns((prev) => prev.filter((c) => c.id !== id)),
    [],
  );

  const sendCampaign = useCallback((id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "sent",
              sent_count: 12000 + Math.floor(Math.random() * 2500),
              open_rate: +(20 + Math.random() * 9).toFixed(1),
              sent_at: today(),
            }
          : c,
      ),
    );
  }, []);

  const addSubscriber = useCallback((email: string, name: string) => {
    const normalized = email.trim().toLowerCase();
    let added = false;
    setSubscribers((prev) => {
      if (prev.some((s) => s.email.toLowerCase() === normalized)) return prev;
      added = true;
      return [
        {
          id: uid(),
          email: normalized,
          name: name.trim() || normalized.split("@")[0],
          status: "active",
          joined: today(),
          tags: ["new"],
        },
        ...prev,
      ];
    });
    return added;
  }, []);

  const toggleSubscriber = useCallback(
    (id: string) =>
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: s.status === "active" ? "unsubscribed" : "active" }
            : s,
        ),
      ),
    [],
  );

  const deleteSubscriber = useCallback(
    (id: string) => setSubscribers((prev) => prev.filter((s) => s.id !== id)),
    [],
  );

  const addTemplate: StoreValue["addTemplate"] = useCallback((input) => {
    setTemplates((prev) => [
      {
        id: uid(),
        name: input.name,
        category: input.category,
        accent: input.accent,
        description: "Custom template created in your workspace.",
        uses: 0,
        updated: today(),
      },
      ...prev,
    ]);
  }, []);

  const duplicateTemplate = useCallback(
    (id: string) =>
      setTemplates((prev) => {
        const source = prev.find((t) => t.id === id);
        if (!source) return prev;
        return [
          { ...source, id: uid(), name: `${source.name} (copy)`, uses: 0, updated: today() },
          ...prev,
        ];
      }),
    [],
  );

  const deleteTemplate = useCallback(
    (id: string) => setTemplates((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const updateSettings = useCallback(
    (patch: Partial<WorkspaceSettings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    [],
  );

  const setNotification = useCallback(
    (key: keyof WorkspaceSettings["notifications"], value: boolean) =>
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      })),
    [],
  );

  const resetDemoData = useCallback(() => {
    setCampaigns(SEED_CAMPAIGNS);
    setSubscribers(SEED_SUBSCRIBERS);
    setTemplates(SEED_TEMPLATES);
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      campaigns,
      subscribers,
      templates,
      settings,
      addCampaign,
      deleteCampaign,
      sendCampaign,
      addSubscriber,
      toggleSubscriber,
      deleteSubscriber,
      addTemplate,
      duplicateTemplate,
      deleteTemplate,
      updateSettings,
      setNotification,
      resetDemoData,
    }),
    [
      campaigns,
      subscribers,
      templates,
      settings,
      addCampaign,
      deleteCampaign,
      sendCampaign,
      addSubscriber,
      toggleSubscriber,
      deleteSubscriber,
      addTemplate,
      duplicateTemplate,
      deleteTemplate,
      updateSettings,
      setNotification,
      resetDemoData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function SEED_SUBSCRIBNS_SAFE(): Subscriber[] {
  return SEED_SUBSCRIBERS;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
