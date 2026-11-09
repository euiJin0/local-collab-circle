import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Search, Sparkle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppScreen } from "@/components/AppShell";
import { LeafMark } from "@/components/Logo";
import { NearbyMap } from "@/components/NearbyMap";
import { GradeChip, PartnerAvatar, RoleBadge } from "@/components/PartnerBits";
import { CATEGORIES, distanceKm, formatDistance, ME_LOCATION, PARTNERS, recommendPartners, ROLE_LABEL, type Role } from "@/lib/colabi";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "탐색 — 내 주변 파트너 찾기 | 콜라비" },
      { name: "description", content: "지도에서 내 주변 창작자와 소상공인을 찾고, 가까운 추천 파트너를 만나보세요." },
      { property: "og:title", content: "탐색 — 내 주변 파트너 찾기 | 콜라비" },
      { property: "og:description", content: "지도에서 내 주변 창작자와 소상공인을 찾아보세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explore,
});

type RoleFilter = "all" | Role;

function Explore() {
  const { profile } = useStore();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [cat, setCat] = useState<string>("전체");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim();
    return PARTNERS.filter(
      (p) =>
        (roleFilter === "all" || p.role === roleFilter) &&
        (cat === "전체" || p.category === cat) &&
        (!query || p.name.includes(query) || p.category.includes(query) || p.tags.some((t) => t.includes(query)) || p.area.includes(query)),
    )
      .map((p) => ({ p, km: distanceKm(ME_LOCATION, p) }))
      .sort((a, b) => a.km - b.km);
  }, [roleFilter, cat, q]);

  const partners = useMemo(() => filtered.map((f) => f.p), [filtered]);
  const recs = useMemo(() => recommendPartners(profile.role, ME_LOCATION, 5), [profile.role]);
  const sel = filtered.find((f) => f.p.id === selected);
  const lookingFor = profile.role ? ROLE_LABEL[profile.role === "creator" ? "owner" : "creator"] : "파트너";

  return (
    <AppScreen>
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <LeafMark className="h-7 w-7" />
          <div>
            <p className="font-display text-xl leading-none">콜라비</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {ME_LOCATION.label}
            </p>
          </div>
        </div>
        {profile.role && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${profile.role === "creator" ? "bg-primary" : "bg-secondary text-secondary-foreground"}`}>
            {ROLE_LABEL[profile.role]} 모드
          </span>
        )}
      </header>

      <div className="px-5">
        <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="가게, 창작자, 분야 검색"
            className="flex-1 bg-transparent text-sm outline-none"
            aria-label="파트너 검색"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="검색어 지우기">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="scrollbar-none -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {(["all", "creator", "owner"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${roleFilter === r ? "bg-foreground text-background" : "bg-card text-muted-foreground shadow-card"}`}
            >
              {r === "all" ? "전체" : r === "creator" ? "🎨 창작자" : "🏪 소상공인"}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" />
          {["전체", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${cat === c ? "border-foreground bg-accent font-bold" : "bg-card text-muted-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="relative mx-5 mt-4 h-[320px] overflow-hidden rounded-3xl border shadow-card">
        <NearbyMap center={ME_LOCATION} partners={partners} selectedId={selected} onSelect={setSelected} />
        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5 text-[11px] font-bold">
          <span className="rounded-full bg-primary px-2 py-1">● 창작자</span>
          <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">● 소상공인</span>
        </div>
        {sel && (
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
            <PartnerAvatar p={sel.p} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-bold">{sel.p.name}</p>
                <RoleBadge role={sel.p.role} />
              </div>
              <p className="text-xs text-muted-foreground">
                {sel.p.category} · {sel.p.area} · {formatDistance(sel.km)}
              </p>
            </div>
            <Link to="/partner/$id" params={{ id: sel.p.id }} className="rounded-xl bg-foreground px-3 py-2 text-xs font-bold text-background">
              보기
            </Link>
          </div>
        )}
      </section>
      <p className="mx-5 mt-2 text-right text-xs text-muted-foreground">반경 2km 안에 {filtered.length}명의 파트너</p>

      <section className="mt-5">
        <div className="flex items-end justify-between px-5">
          <div>
            <p className="flex items-center gap-1 text-xs font-bold text-secondary-strong">
              <Sparkle className="h-3.5 w-3.5" /> 콜라비 추천
            </p>
            <h2 className="text-lg font-bold">근처에 이런 {lookingFor}가 있어요</h2>
          </div>
        </div>
        <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {recs.map(({ partner: p, km, match }) => (
            <Link
              key={p.id}
              to="/partner/$id"
              params={{ id: p.id }}
              className="w-44 shrink-0 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <PartnerAvatar p={p} size="h-11 w-11 text-xl" />
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold">매칭 {match}%</span>
              </div>
              <p className="mt-3 truncate font-bold">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.category} · {formatDistance(km)}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.intro}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pb-6 pt-4">
        <h2 className="mb-2 text-lg font-bold">가까운 순</h2>
        <ul className="divide-y rounded-2xl border bg-card">
          {filtered.map(({ p, km }) => (
            <li key={p.id} className="flex items-center pr-3">
              <button onClick={() => setSelected(p.id)} className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left">
                <PartnerAvatar p={p} size="h-10 w-10 text-lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold">{p.name}</p>
                    <RoleBadge role={p.role} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{formatDistance(km)}</span>·<span>{p.category}</span>
                    <GradeChip p={p} />
                  </div>
                </div>
              </button>
              <Link to="/partner/$id" params={{ id: p.id }} aria-label={`${p.name} 프로필`} className="rounded-full p-1 hover:bg-muted">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
          {filtered.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">조건에 맞는 파트너가 없어요.</li>}
        </ul>
      </section>
    </AppScreen>
  );
}
