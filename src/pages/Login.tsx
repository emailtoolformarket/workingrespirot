import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MailOpen,
  Send,
  Wand2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";
import { FlightPath, LogoMark } from "../components/icons";

const DEMO_EMAIL = "demo@emailsaas.com";
const DEMO_PASSWORD = "Demo@1234";

export default function Login() {
  const { user, initializing, login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  // Signed-in users have nothing to do here.
  if (!initializing && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const autofill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
    push("Demo credentials filled — hit “Sign in”.", "success");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password. Use demo@emailsaas.com / Demo@1234."
          : "Sign-in failed. Use the demo credentials: demo@emailsaas.com / Demo@1234.";
      setError(message);
      setShakeKey((key) => key + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ---------- Brand panel ---------- */}
      <aside className="relative hidden w-[52%] overflow-hidden bg-slate-950 lg:block">
        <div className="bg-grid-dark absolute inset-0" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* floating mail glyphs */}
        <Mail
          className="animate-float-slow absolute top-[16%] right-[14%] h-14 w-14 text-indigo-400/25"
          style={{ "--tilt": "12deg" } as React.CSSProperties}
        />
        <Send
          className="animate-float-slower absolute top-[58%] left-[10%] h-10 w-10 text-indigo-300/20"
          style={{ "--tilt": "-8deg" } as React.CSSProperties}
        />
        <MailOpen
          className="animate-float-slow absolute right-[22%] bottom-[18%] h-12 w-12 text-indigo-400/20"
          style={{ "--tilt": "6deg" } as React.CSSProperties}
        />
        <FlightPath className="animate-dash absolute top-[30%] left-0 w-[420px] opacity-70" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex animate-fade-in items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Relay
            </span>
          </div>

          <div className="max-w-xl">
            <p className="animate-fade-up font-display text-sm font-semibold tracking-[0.2em] text-indigo-400 uppercase">
              Email marketing console
            </p>
            <h1
              className="animate-fade-up mt-4 font-display text-5xl leading-[1.05] font-bold tracking-tight text-white xl:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Send email people actually open.
            </h1>
            <p
              className="animate-fade-up mt-5 text-lg leading-relaxed text-slate-400"
              style={{ animationDelay: "160ms" }}
            >
              Campaigns, subscribers and deliverability in one fast dashboard —
              built for teams that ship every week.
            </p>

            {/* live campaign preview */}
            <LivePreviewCard />
          </div>

          <div
            className="flex animate-fade-up items-center gap-8"
            style={{ animationDelay: "240ms" }}
          >
            <PanelStat value="99.98%" label="deliverability" />
            <span className="h-10 w-px bg-slate-800" />
            <PanelStat value="24.5%" label="avg. open rate" />
            <span className="h-10 w-px bg-slate-800" />
            <PanelStat value="14.5k" label="subscribers" />
          </div>
        </div>
      </aside>

      {/* ---------- Sign-in form ---------- */}
      <main className="bg-dots-light relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="animate-fade-up mb-10 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              Relay
            </span>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-500">
              Sign in to your workspace. Sessions expire after 30 minutes.
            </p>
          </div>

          {error && (
            <div
              key={shakeKey}
              role="alert"
              className="animate-shake mt-6 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="animate-fade-up mt-8 space-y-5"
            style={{ animationDelay: "120ms" }}
            noValidate
          >
            <Field label="Email address" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pr-4 pl-11 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pr-12 pl-11 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-display text-sm font-semibold tracking-wide text-white shadow-md shadow-indigo-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>
          </form>

          {/* demo credentials */}
          <div
            className="animate-fade-up mt-8 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 p-4"
            style={{ animationDelay: "180ms" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-slate-800">MVP demo account</p>
                  <p className="font-mono text-xs text-slate-500">
                    {DEMO_EMAIL} · {DEMO_PASSWORD}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={autofill}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Autofill
              </button>
            </div>
          </div>

          <p
            className="animate-fade-up mt-8 text-center text-xs text-slate-400"
            style={{ animationDelay: "240ms" }}
          >
            Secured with HS256 JWTs · POST /api/auth/login · GET /api/auth/me
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function PanelStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
    </div>
  );
}

function LivePreviewCard() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(27.4), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className="animate-fade-up mt-8 max-w-sm rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-indigo-950/40"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase">
          Top campaign this week
        </p>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      </div>
      <p className="mt-2 font-display text-lg font-semibold text-white">Spring Product Launch</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
            style={{ width: `${(width / 40) * 100}%` }}
          />
        </div>
        <span className="font-display text-sm font-bold text-indigo-300 tabular-nums">
          {width.toFixed(1)}%
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">12,480 sends · open rate climbing toward 27.4%</p>
    </div>
  );
}
