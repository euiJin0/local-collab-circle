import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ChevronLeft, FileSignature, MapPin, MessageCircle } from "lucide-react";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { PartnerAvatar, RoleBadge } from "@/components/PartnerBits";
import { collabTypeTitle, distanceKm, getCollabType, formatDistance, getPartner, gradeForPartner, ME_LOCATION } from "@/lib/colabi";

export const Route = createFileRoute("/partner/$id")({
  loader: ({ params }) => {
    const partner = getPartner(params.id);
    if (!partner) throw notFound();
    return { partner };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.partner.name;
    const title = name ? `${name} — 콜라비 파트너` : "파트너 — 콜라비";
    const desc = loaderData?.partner.intro ?? "콜라비 파트너 프로필";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PartnerPage,
});

function PartnerPage() {
  const { partner: p } = Route.useLoaderData();
  const router = useRouter();
  const g = gradeForPartner(p);
  return (
    <PhoneFrame>
      <SubHeader
        title="파트너 프로필"
        back={
          <button onClick={() => router.history.back()} aria-label="뒤로" className="rounded-full p-1.5 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
      />
      <div className="flex-1 px-5 pb-32 pt-6">
        <div className="flex items-center gap-4">
          <PartnerAvatar p={p} size="h-20 w-20 text-4xl" />
          <div>
            <RoleBadge role={p.role} />
            <h2 className="mt-1 font-display text-2xl">{p.name}</h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {p.area} · {formatDistance(distanceKm(ME_LOCATION, p))}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-brand p-3">
            <p className="text-2xl">{g.emoji}</p>
            <p className="text-xs font-bold">{g.name} 등급</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <p className="font-display text-2xl">{p.colabiScore}</p>
            <p className="text-xs text-muted-foreground">콜라비 지수</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-card">
            <p className="font-display text-2xl">{p.completed}</p>
            <p className="text-xs text-muted-foreground">완료 콜라보</p>
          </div>
        </div>

        <h3 className="mt-6 text-sm font-bold">소개</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.intro}</p>

        <h3 className="mt-5 text-sm font-bold">{collabTypeTitle(p.role)}</h3>
        <ul className="mt-2 space-y-2">
          {p.collabTypes.map((id) => {
            const t = getCollabType(id);
            if (!t) return null;
            return (
              <li key={id} className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-card">
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.items.join(" · ")}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <h3 className="mt-5 text-sm font-bold">분야 · 키워드</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {[p.category, ...p.tags].map((t) => (
            <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              #{t}
            </span>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 gap-2 border-t bg-card p-4">
        <Link to="/chat/$id" params={{ id: p.id }} className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border font-bold">
          <MessageCircle className="h-4 w-4" /> 채팅하기
        </Link>
        <Link to="/propose/$id" params={{ id: p.id }} className="flex h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-2xl bg-brand font-bold shadow-soft">
          <FileSignature className="h-4 w-4" /> 콜라보 제안하기
        </Link>
      </div>
    </PhoneFrame>
  );
}
