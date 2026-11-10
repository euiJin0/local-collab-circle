import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { getPartner } from "@/lib/colabi";
import { earningsSummary, feeSplit, formatWon, PLATFORM_FEE_LABEL } from "@/lib/money";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [
      { title: "수익 내역 — 콜라비" },
      { name: "description", content: "지금까지 받은 수익과 정산 예정 수익을 플랫폼 수수료 8%를 뺀 금액으로 확인하세요." },
      { property: "og:title", content: "수익 내역 — 콜라비" },
      { property: "og:description", content: "받은 수익과 앞으로 받을 수익을 한눈에 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EarningsPage,
});

const STATUS = { done: "정산 완료", ongoing: "정산 예정", received: "서명 대기", sent: "서명 대기" } as const;

function EarningsPage() {
  const { projects, settings } = useStore();
  const router = useRouter();
  const sum = earningsSummary(projects);
  const items = projects
    .filter((p) => p.payee === "me" && p.amount)
    .sort((a, b) => (a.status === b.status ? b.createdAt.localeCompare(a.createdAt) : a.status === "done" ? 1 : -1));

  return (
    <PhoneFrame>
      <SubHeader
        title="수익 내역"
        back={
          <button onClick={() => router.history.back()} aria-label="뒤로" className="rounded-full p-1.5 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
      />
      <div className="flex-1 space-y-4 px-5 pb-8 pt-5">
        <section className="rounded-3xl bg-glow p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">지금까지 받은 수익</p>
          <p className="font-display text-4xl">{formatWon(sum.received.net)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            총 거래 {formatWon(sum.received.gross)} − 수수료 {formatWon(sum.received.fee)} · {sum.received.count}건
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-card p-3">
              <p className="text-[11px] text-muted-foreground">정산 예정 (진행중)</p>
              <p className="font-bold">{formatWon(sum.upcoming.net)}</p>
            </div>
            <div className="rounded-2xl bg-card p-3">
              <p className="text-[11px] text-muted-foreground">서명 대기 제안</p>
              <p className="font-bold">{formatWon(sum.pending.net)}</p>
            </div>
          </div>
        </section>

        <p className="rounded-2xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
          모든 금액은 콜라비 플랫폼 수수료 {PLATFORM_FEE_LABEL}를 뺀 실제로 받는 금액이에요. 프로젝트가 완료되면 {settings.account ? `${settings.bank} ${settings.account}` : "등록한 정산 계좌"}로 정산돼요.
          {!settings.account && (
            <Link to="/settings" className="ml-1 font-bold text-foreground underline">
              계좌 등록하기
            </Link>
          )}
        </p>

        <ul className="space-y-2">
          {items.map((p) => {
            const s = feeSplit(p.amount!);
            const partner = getPartner(p.partnerId);
            return (
              <li key={p.id}>
                <Link to="/project/$id" params={{ id: p.id }} className="block rounded-2xl border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{p.contract.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {partner?.emoji} {partner?.name} · {p.contract.endDate}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${p.status === "done" ? "bg-primary" : "bg-muted text-muted-foreground"}`}>{STATUS[p.status]}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between text-xs text-muted-foreground">
                    <span>
                      {formatWon(s.gross)} − 수수료 {formatWon(s.fee)}
                    </span>
                    <span className="font-display text-lg text-foreground">{formatWon(s.net)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
          {items.length === 0 && <li className="py-12 text-center text-sm text-muted-foreground">아직 수익 내역이 없어요.</li>}
        </ul>
      </div>
    </PhoneFrame>
  );
}
