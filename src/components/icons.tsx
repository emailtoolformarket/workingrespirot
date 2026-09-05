/** Hand-drawn brand mark for Relay — a paper plane leaving its tile. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="10" className="fill-indigo-600" />
      <rect x="2" y="2" width="36" height="36" rx="10" className="fill-white/10" />
      <path d="M9.5 21.8 30.5 12l-6.8 18.5-4.2-7.9-10 -0.8Z" className="fill-white" />
      <path
        d="M19.5 22.6 30.5 12"
        className="stroke-indigo-300"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Small dotted flight-path used as ambient decoration on the login panel. */
export function FlightPath({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 160 C 80 150, 110 60, 170 70 S 280 30, 312 14"
        className="stroke-indigo-400/40"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 12"
      />
    </svg>
  );
}
