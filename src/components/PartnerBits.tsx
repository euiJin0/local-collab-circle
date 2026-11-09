import { gradeForPartner, ROLE_LABEL, type Partner } from "@/lib/colabi";

export function RoleBadge({ role }: { role: Partner["role"] }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${role === "creator" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

export function PartnerAvatar({ p, size = "h-12 w-12 text-2xl" }: { p: Partner; size?: string }) {
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-2xl ${p.role === "creator" ? "bg-primary" : "bg-secondary"}`}>
      {p.emoji}
    </div>
  );
}

export function GradeChip({ p }: { p: Partner }) {
  const g = gradeForPartner(p);
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {g.emoji} {g.name} · {p.colabiScore}
    </span>
  );
}
