import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppScreen } from "@/components/AppShell";
import { PartnerAvatar } from "@/components/PartnerBits";
import { getPartner } from "@/lib/colabi";
import { formatWon } from "@/lib/money";
import { useStore, type ProjectStatus } from "@/lib/store";

const TABS: { key: ProjectStatus; label: string }[] = [
  { key: "ongoing", label: "진행중" },
  { key: "received", label: "제안받은" },
  { key: "sent", label: "보낸 제안" },
  { key: "done", label: "완료" },
];

const isTab = (v: unknown): v is ProjectStatus => TABS.some((t) => t.key === v);

export const Route = createFileRoute("/projects")({
  validateSearch: (s: Record<string, unknown>): { tab?: ProjectStatus } => (isTab(s["tab"]) ? { tab: s["tab"] } : {}),
  head: () => ({
    meta: [
      { title: "내 프로젝트 — 콜라비" },
      { name: "description", content: "진행중, 제안받은, 보낸 제안, 완료한 콜라보 프로젝트를 한눈에 확인하세요." },
      { property: "og:title", content: "내 프로젝트 — 콜라비" },
      { property: "og:description", content: "진행중·제안받은·완료 프로젝트를 나눠서 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

const EMPTY: Record<ProjectStatus, string> = {
  ongoing: "진행중인 프로젝트가 없어요. 탐색에서 파트너를 찾아보세요!",
  received: "아직 받은 제안이 없어요.",
  sent: "보낸 제안이 없어요.",
  done: "완료한 프로젝트가 아직 없어요.",
};

function ProjectsPage() {
  const { tab = "ongoing" } = Route.useSearch();
  const navigate = useNavigate({ from: "/projects" });
  const { projects } = useStore();
  const list = projects.filter((p) => p.status === tab);

  return (
    <AppScreen title="프로젝트">
      <div className="sticky top-[68px] z-10 bg-background/95 px-5 pb-3 backdrop-blur">
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1">
          {TABS.map((t) => {
            const n = projects.filter((p) => p.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => navigate({ search: { tab: t.key } })}
                className={`rounded-xl py-2 text-xs font-bold transition ${tab === t.key ? "bg-card shadow-card" : "text-muted-foreground"}`}
              >
                {t.label}
                <span className={`ml-1 ${tab === t.key ? "text-secondary-strong" : ""}`}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ul className="space-y-3 px-5 pb-6">
        {list.map((pr) => {
          const partner = getPartner(pr.partnerId);
          return (
            <li key={pr.id}>
              <Link to="/project/$id" params={{ id: pr.id }} className="block rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  {partner && <PartnerAvatar p={partner} size="h-11 w-11 text-xl" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{pr.contract.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {partner?.name} · {pr.contract.startDate} ~ {pr.contract.endDate}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                {pr.status === "ongoing" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>진행률</span>
                      <span className="font-bold text-foreground">{pr.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${pr.progress}%` }} />
                    </div>
                  </div>
                )}
                {pr.status === "received" && (
                  <p className="mt-3 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground">📄 계약서 확인 후 서명이 필요해요 · {pr.contract.category} · 예상 매출 {formatWon(pr.contract.revenue)}</p>
                )}
                {pr.status === "sent" && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">⏳ 상대방의 서명을 기다리는 중</p>}
                {pr.status === "done" && <p className="mt-3 rounded-xl bg-primary/50 px-3 py-2 text-xs font-bold">✓ 계약 이행 완료</p>}
              </Link>
            </li>
          );
        })}
        {list.length === 0 && <li className="py-16 text-center text-sm text-muted-foreground">{EMPTY[tab]}</li>}
      </ul>
    </AppScreen>
  );
}
