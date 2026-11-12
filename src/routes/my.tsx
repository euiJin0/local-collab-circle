import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, CreditCard, Info, Plus, Settings as SettingsIcon, Trash2, UserRound, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppScreen } from "@/components/AppShell";
import { CollabTypeChips } from "@/components/CollabTypes";
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
import { earningsSummary, formatWon, myRate, myShare, pct, PLATFORM_FEE_LABEL, revenueSplit } from "@/lib/money";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/my")({
  head: () => ({
    meta: [
      { title: "마이페이지 · 콜라비 지수와 수익 — 콜라비" },
      { name: "description", content: "나의 콜라비 지수와 등급, 지금까지 받은 수익, 내가 올린 콜라보와 설정을 확인하세요." },
      { property: "og:title", content: "마이페이지 · 콜라비 지수와 수익 — 콜라비" },
      { property: "og:description", content: "콜라비 지수, 받은 수익, 내 콜라보 글을 한눈에." },
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
  const { profile, projects, posts, settings, updatePost, removePost } = useStore();
  const [showInfo, setShowInfo] = useState(false);
  const completed = projects.filter((p) => p.status === "done" && p.progress === 100).length;
  const ongoing = projects.filter((p) => p.status === "ongoing").length;
  const stats: ColabiStats = { ...BASE_STATS, completed };
  const score = colabiScore(stats);
  const grade = colabiGrade(score);
  const next = nextGrade(score);
  const b = colabiBreakdown(stats);
  const earn = earningsSummary(projects, profile.role);

  const items = [
    { label: "소통 점수", value: `${stats.communication}점`, pct: b.communication, w: COLABI_WEIGHTS.communication },
    { label: "완료 프로젝트", value: `${completed}건`, pct: b.completed, w: COLABI_WEIGHTS.completed },
    { label: "평균 평점", value: `★ ${stats.rating}`, pct: b.rating, w: COLABI_WEIGHTS.rating },
    { label: "응답률", value: `${stats.responseRate}%`, pct: b.responseRate, w: COLABI_WEIGHTS.responseRate },
  ];

  const role = profile.role;
  const menu = [
    { icon: UserRound, label: "프로필 · 역할 변경", sub: role ? ROLE_LABEL[role] : "역할 미선택" },
    { icon: Bell, label: "알림 설정", sub: settings.notifyChat || settings.notifyProposal ? "켜짐" : "꺼짐" },
    { icon: CreditCard, label: "정산 계좌", sub: settings.account ? `${settings.bank} ****${settings.account.slice(-4)}` : "미등록" },
    { icon: SettingsIcon, label: "앱 설정 · 초기화", sub: "" },
  ];

  return (
    <AppScreen
      title="마이페이지"
      right={
        <Link to="/settings" aria-label="설정" className="rounded-full p-2 hover:bg-muted">
          <SettingsIcon className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-4 px-5 pb-8">
        <section className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${role === "owner" ? "bg-secondary" : "bg-primary"}`}>
            {role === "owner" ? "🏪" : "🎨"}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{profile.nickname || "콜라비 유저"}</p>
            <p className="text-sm text-muted-foreground">
              {role ? ROLE_LABEL[role] : "역할 미선택"} · {settings.area}
            </p>
            <p className="mt-1 text-xs font-bold">
              {grade.emoji} {grade.name} 등급
            </p>
          </div>
          <Link to="/settings" className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold">
            프로필 수정
          </Link>
        </section>

        {/* 수익 */}
        <section className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-bold">
              <Wallet className="h-4 w-4" /> 내 수익
            </h2>
            <Link to="/earnings" className="flex items-center text-xs text-muted-foreground">
              전체 내역 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">지금까지 받은 수익</p>
          <p className="font-display text-3xl">{formatWon(earn.received.net)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
              <p className="text-[11px]">앞으로 받을 수익</p>
              <p className="font-bold">{formatWon(earn.upcoming.net)}</p>
              <p className="text-[10px] opacity-70">진행중 {earn.upcoming.count}건</p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">서명 대기 제안</p>
              <p className="font-bold">{formatWon(earn.pending.net)}</p>
              <p className="text-[10px] text-muted-foreground">{earn.pending.count}건</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            콜라보 매출 중 분야별 권장 비율(기본값) 또는 직접 정한 비율에 따른 내 몫이에요. 콜라비 수수료는 매출의 {PLATFORM_FEE_LABEL}로 고정이에요.
          </p>
        </section>

        {/* 내 콜라보 글 */}
        <section className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">내가 올린 콜라보</h2>
            <Link to="/post/new" className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold">
              <Plus className="h-3.5 w-3.5" /> 올리기
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {posts.map((po) => {
              const s = revenueSplit(po.amount, po.category, po.creatorPct);
              return (
                <li key={po.id} className={`rounded-2xl border p-3 ${po.status === "closed" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{po.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {po.category} · {po.duration} · {po.status === "open" ? "모집중" : "마감"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        removePost(po.id);
                        toast("글을 삭제했어요");
                      }}
                      aria-label={`${po.title} 삭제`}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <CollabTypeChips ids={po.collabTypes ?? []} size="xs" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {po.skills.map((sk) => (
                      <span key={sk} className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold">
                        #{sk}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-end justify-between text-xs">
                    <span className="text-muted-foreground">
                      예상 매출 {formatWon(s.gross)} · 내 몫 {pct(myRate(po.category, profile.role, po.creatorPct))}
                    </span>
                    <span className="font-bold">
                      받을 금액 {formatWon(myShare(s, profile.role))}
                    </span>
                  </div>
                  <button
                    onClick={() => updatePost(po.id, { status: po.status === "open" ? "closed" : "open" })}
                    className="mt-2 text-[11px] text-muted-foreground underline"
                  >
                    {po.status === "open" ? "모집 마감하기" : "다시 모집하기"}
                  </button>
                </li>
              );
            })}
            {posts.length === 0 && (
              <li className="rounded-2xl bg-muted p-4 text-center text-xs text-muted-foreground">
                아직 올린 콜라보가 없어요. 쓸 재능과 예상 매출을 올려보세요!
              </li>
            )}
          </ul>
        </section>

        {/* 콜라비 지수 */}
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

          <div className="mt-4 grid grid-cols-4">
            {GRADES.map((g) => (
              <div key={g.name} className={`flex flex-col items-center text-[11px] ${g.name === grade.name ? "font-bold" : "text-muted-foreground opacity-60"}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${g.name === grade.name ? "bg-card shadow-card" : ""}`}>{g.emoji}</span>
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

        {/* 설정 */}
        <section>
          <h2 className="mb-2 px-1 text-xs font-bold text-muted-foreground">설정</h2>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-card">
            {menu.map(({ icon: Icon, label, sub }) => (
              <li key={label}>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{label}</span>
                  {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppScreen>
  );
}
