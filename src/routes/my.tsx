import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, Info, RotateCcw } from "lucide-react";
import { useState } from "react";
import { AppScreen } from "@/components/AppShell";
import {
  COLABI_WEIGHTS,
  COMPLETED_FOR_MAX,
  colabiBreakdown,
  colabiGrade,
  colabiScore,
  GRADES,
  nextGrade,
  ROLE_LABEL,
  type ColabiStats,
} from "@/lib/colabi";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/my")({
  head: () => ({
    meta: [
      { title: "마이페이지 · 콜라비 지수 — 콜라비" },
      { name: "description", content: "소통 점수와 완료 프로젝트로 매겨지는 나의 콜라비 지수와 등급을 확인하세요." },
      { property: "og:title", content: "마이페이지 · 콜라비 지수 — 콜라비" },
      { property: "og:description", content: "나의 콜라비 지수와 등급을 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyPage,
});

/** 프로토타입용 기본 활동 수치 (완료 프로젝트 수는 실제 프로젝트에서 계산) */
const BASE_STATS = { communication: 86, responseRate: 92, rating: 4.7 };

function Ring({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" style={{ stroke: "var(--muted)" }} />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        style={{ stroke: "var(--primary-strong)", transition: "stroke-dashoffset .8s ease" }}
      />
    </svg>
  );
}

function MyPage() {
  const { profile, projects, setProfile, reset } = useStore();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const completed = projects.filter((p) => p.status === "done" && p.progress === 100).length;
  const ongoing = projects.filter((p) => p.status === "ongoing").length;
  const stats: ColabiStats = { ...BASE_STATS, completed };
  const score = colabiScore(stats);
  const grade = colabiGrade(score);
  const next = nextGrade(score);
  const b = colabiBreakdown(stats);

  const items = [
    { label: "소통 점수", value: `${stats.communication}점`, pct: b.communication, w: COLABI_WEIGHTS.communication },
    { label: "완료 프로젝트", value: `${completed}건`, pct: b.completed, w: COLABI_WEIGHTS.completed },
    { label: "평균 평점", value: `★ ${stats.rating}`, pct: b.rating, w: COLABI_WEIGHTS.rating },
    { label: "응답률", value: `${stats.responseRate}%`, pct: b.responseRate, w: COLABI_WEIGHTS.responseRate },
  ];

  const role = profile.role;

  return (
    <AppScreen title="마이페이지">
      <div className="space-y-4 px-5 pb-8">
        <section className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${role === "owner" ? "bg-secondary" : "bg-primary"}`}>
            {role === "owner" ? "🏪" : "🎨"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{profile.nickname || "콜라비 유저"}</p>
            <p className="text-sm text-muted-foreground">{role ? ROLE_LABEL[role] : "역할 미선택"} · 마포구 망원동</p>
          </div>
          <button
            onClick={() => setProfile({ role: role === "creator" ? "owner" : "creator" })}
            className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" /> 역할 전환
          </button>
        </section>

        <section className="overflow-hidden rounded-3xl bg-glow p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">콜라비 지수</h2>
            <button onClick={() => setShowInfo((v) => !v)} className="flex items-center gap-1 text-xs text-muted-foreground" aria-expanded={showInfo}>
              <Info className="h-3.5 w-3.5" /> 산정 기준
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative">
              <Ring value={score} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl">{score}</span>
                <span className="text-[11px] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div>
              <p className="text-3xl">{grade.emoji}</p>
              <p className="font-display text-2xl">{grade.name} 등급</p>
              <p className="text-xs text-muted-foreground">{grade.desc}</p>
              {next && (
                <p className="mt-2 rounded-full bg-card px-3 py-1 text-[11px] font-bold">
                  {next.emoji} {next.name}까지 {next.min - score}점
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {items.map((it) => (
              <div key={it.label}>
                <div className="flex justify-between text-xs">
                  <span className="font-bold">
                    {it.label} <span className="font-normal text-muted-foreground">({Math.round(it.w * 100)}%)</span>
                  </span>
                  <span>{it.value}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-card">
                  <div className="h-full rounded-full bg-leaf" style={{ width: `${it.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {showInfo && (
            <div className="mt-4 rounded-2xl bg-card p-4 text-xs leading-relaxed text-muted-foreground">
              소통 점수 35% + 완료 프로젝트 30% (최대 {COMPLETED_FOR_MAX}건) + 평균 평점 20% + 응답률 15%를 더해 100점 만점으로 계산해요.
            </div>
          )}

          <div className="mt-4 flex justify-between">
            {GRADES.map((g) => (
              <div key={g.name} className={`flex flex-col items-center text-[10px] ${g.name === grade.name ? "font-bold" : "text-muted-foreground opacity-60"}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${g.name === grade.name ? "bg-card shadow-card" : ""}`}>{g.emoji}</span>
                {g.name}
                <span>{g.min}+</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2 text-center">
          {[
            ["진행중", ongoing, "ongoing"],
            ["제안받은", projects.filter((p) => p.status === "received").length, "received"],
            ["완료", completed, "done"],
          ].map(([l, n, tab]) => (
            <Link key={l as string} to="/projects" search={{ tab: tab as "ongoing" | "received" | "done" }} className="rounded-2xl bg-card p-3 shadow-card">
              <p className="font-display text-2xl">{n}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </Link>
          ))}
        </section>

        <button
          onClick={() => {
            reset();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border py-3 text-sm text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" /> 처음부터 다시 시작 (예시 데이터 초기화)
        </button>
      </div>
    </AppScreen>
  );
}
