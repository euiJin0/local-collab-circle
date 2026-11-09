import { useId } from "react";

export function LeafMark({ className = "h-10 w-10" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--leaf-1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--leaf-2)" }} />
        </linearGradient>
      </defs>
      <path d="M32 5 C 21 16 13 27 13 39 a19 19 0 0 0 38 0 C51 27 43 16 32 5Z" fill={`url(#${id})`} />
      <path d="M32 9 V 58" style={{ stroke: "var(--card)" }} strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="32" cy="39" r="6.5" style={{ fill: "var(--foreground)" }} />
    </svg>
  );
}

export function AppIcon({ size = "h-32 w-32" }: { size?: string }) {
  return (
    <div className={`${size} flex items-center justify-center rounded-[2rem] bg-card shadow-soft`}>
      <LeafMark className="h-1/2 w-1/2" />
    </div>
  );
}
