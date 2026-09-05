/**
 * API client for the Relay backend (FastAPI).
 *
 * Every call first hits the real endpoints under `/api` (proxied to
 * `http://localhost:8000` by Vite in dev — see the proxy snippet in the
 * README). When no backend is reachable — e.g. this statically hosted demo —
 * a faithful in-browser mock takes over. It mirrors the exact routes,
 * payloads and auth rules implemented in `backend/routers/`, including the
 * hardcoded demo credentials and a signed-token expiry of 30 minutes.
 */
import axios from "axios";

export interface User {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export type CampaignStatus = "sent" | "scheduled" | "draft";

export interface Campaign {
  name: string;
  subject: string;
  status: CampaignStatus;
  sent_count: number;
  open_rate: number;
  sent_at: string;
}

export interface EngagementPoint {
  day: string;
  opens: number;
  clicks: number;
}

export interface DashboardStats {
  total_subscribers: number;
  emails_sent_this_month: number;
  average_open_rate: number;
  average_click_rate: number;
  recent_campaigns: Campaign[];
  engagement_chart: EngagementPoint[];
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const http = axios.create({ baseURL: "/api", timeout: 3500 });

/** Statuses that carry real semantic meaning from a live backend. */
const REAL_ERROR_STATUSES = [400, 401, 403, 422];

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    return new ApiError(
      err.response?.status ?? 0,
      typeof detail === "string" ? detail : "Request failed",
    );
  }
  return new ApiError(0, "Unexpected error");
}

/** Rejects when the response is not JSON (static hosts echo index.html). */
function expectJson<T>(data: unknown): T {
  if (typeof data !== "object" || data === null) {
    throw new Error("Non-JSON response — backend unreachable");
  }
  return data as T;
}

/**
 * Try the real endpoint; on network-level failure (no backend) fall back to
 * the mock. Semantic errors from a live backend (401, 422, …) are rethrown.
 */
async function withFallback<T>(real: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  try {
    return await real();
  } catch (err) {
    if (
      axios.isAxiosError(err) &&
      err.response &&
      REAL_ERROR_STATUSES.includes(err.response.status)
    ) {
      throw toApiError(err);
    }
    return mock();
  }
}

/* ------------------------------------------------------------------ */
/* In-browser mock — mirrors backend/routers 1:1                       */
/* ------------------------------------------------------------------ */

const DEMO_EMAIL = "demo@emailsaas.com";
const DEMO_PASSWORD = "Demo@1234";
const TOKEN_TTL_SECONDS = 30 * 60; // matches ACCESS_TOKEN_EXPIRE_MINUTES=30

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const b64url = (value: unknown) =>
  btoa(JSON.stringify(value))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const DEMO_USER: User = {
  id: 1,
  email: DEMO_EMAIL,
  full_name: "Demo Marketer",
  plan: "Growth",
  is_active: true,
  created_at: "2025-11-03T09:14:00Z",
};

const MOCK_STATS: DashboardStats = {
  total_subscribers: 14502,
  emails_sent_this_month: 45200,
  average_open_rate: 24.5,
  average_click_rate: 3.2,
  recent_campaigns: [
    {
      name: "Spring Product Launch",
      subject: "Something new just landed 🌱",
      status: "sent",
      sent_count: 12480,
      open_rate: 27.4,
      sent_at: "Feb 12, 2026",
    },
    {
      name: "Weekly Newsletter #42",
      subject: "5 growth loops worth stealing",
      status: "sent",
      sent_count: 14102,
      open_rate: 22.1,
      sent_at: "Feb 9, 2026",
    },
    {
      name: "Re-engagement Drip",
      subject: "We miss you — here's 20% off",
      status: "scheduled",
      sent_count: 0,
      open_rate: 0.0,
      sent_at: "Feb 18, 2026",
    },
  ],
  engagement_chart: [
    { day: "Mon", opens: 4820, clicks: 610 },
    { day: "Tue", opens: 5240, clicks: 705 },
    { day: "Wed", opens: 4980, clicks: 651 },
    { day: "Thu", opens: 6120, clicks: 823 },
    { day: "Fri", opens: 5890, clicks: 764 },
    { day: "Sat", opens: 3940, clicks: 452 },
    { day: "Sun", opens: 4310, clicks: 517 },
  ],
};

function issueToken(email: string): string {
  const header = b64url({ alg: "HS256", typ: "JWT" });
  const payload = b64url({ sub: email, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS });
  const signature = b64url(`relay-mock-signature:${email}`);
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

function requireAuth(token: string): void {
  if (verifyToken(token) !== DEMO_EMAIL) {
    throw new ApiError(401, "Could not validate credentials");
  }
}

/* ------------------------------------------------------------------ */
/* Public endpoints                                                    */
/* ------------------------------------------------------------------ */

export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string }> {
  return withFallback(
    async () =>
      expectJson<{ access_token: string }>(
        (await http.post("/auth/login", { email, password })).data,
      ),
    async () => {
      await wait(750);
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        throw new ApiError(401, "Invalid email or password");
      }
      return { access_token: issueToken(DEMO_EMAIL) };
    },
  );
}

export async function fetchMe(token: string): Promise<User> {
  return withFallback(
    async () =>
      expectJson<User>(
        (await http.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })).data,
      ),
    async () => {
      await wait(350);
      requireAuth(token);
      return DEMO_USER;
    },
  );
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  return withFallback(
    async () =>
      expectJson<DashboardStats>(
        (await http.get("/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }))
          .data,
      ),
    async () => {
      await wait(700);
      requireAuth(token);
      return MOCK_STATS;
    },
  );
}
