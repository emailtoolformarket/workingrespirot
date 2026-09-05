import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoMark } from "./icons";

/**
 * Gate for authenticated routes. While the stored JWT is being validated we
 * show a branded loader; unauthenticated visitors are sent to /login.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <div className="animate-pulse">
          <LogoMark className="h-14 w-14 drop-shadow-lg" />
        </div>
        <p className="font-display text-sm font-medium tracking-wide text-slate-500">
          Checking your session…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
