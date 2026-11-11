import type { Role } from "@/lib/colabi";
import { CATEGORIES } from "@/lib/colabi";
import { formatWon, myShare, pct, PLATFORM_FEE_LABEL, PLATFORM_FEE_RATE, REVENUE_SHARE, revenueSplit, shareOf } from "@/lib/money";

/** 콜라보 매출 → 소상공인 / 창작자 / 콜라비 수수료 배분 */
export function RevenueBreakdown({
  amount,
  category,
  role,
  label = "예상 콜라보 매출",
}: {
  amount: number;
  category: string;
  role: Role | null;
  label?: string;
}) {
  const s = revenueSplit(amount, category);
  const sh = shareOf(category);
  const me = role ?? "creator";
  const rows = [
    { key: "owner", name: "소상공인", rate: sh.owner, value: s.owner, bar: "bg-secondary-strong" },
    { key: "creator", name: "창작자", rate: sh.creator, value: s.creator, bar: "bg-primary-strong" },
    { key: "fee", name: "콜라비 수수료 (고정)", rate: PLATFORM_FEE_RATE, value: s.fee, bar: "bg-muted-foreground" },
  ] as const;

  return (
    <div className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-bold">{formatWon(s.gross)}</span>
      </div>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-card">
        {rows.map((r) => (
          <div key={r.key} className={r.bar} style={{ width: `${r.rate * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {rows.map((r) => {
          const mine = r.key === me;
          return (
            <li key={r.key} className={`flex items-center justify-between ${mine ? "font-bold" : "text-muted-foreground"}`}>
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${r.bar}`} />
                {r.name} {pct(r.rate)}
                {mine && <span className="rounded-full bg-card px-1.5 py-0.5 text-[10px]">나</span>}
              </span>
              <span>{r.key === "fee" ? "−" : ""}{formatWon(r.value)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex items-end justify-between border-t border-foreground/10 pt-2">
        <span className="font-bold">내가 받을 금액</span>
        <span className="font-display text-2xl">{formatWon(myShare(s, role))}</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        콜라보 매출은 소상공인 가게에서 생겨요. {category} 분야는 소상공인 {pct(sh.owner)} · 창작자 {pct(sh.creator)}로 나누고, 콜라비 수수료 {PLATFORM_FEE_LABEL}는 모든 분야에서 똑같아요. 프로젝트가 완료되면 각자 몫이 정산돼요.
      </p>
    </div>
  );
}

/** 분야별 배분 기준표 */
export function RevenueShareTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[11px] text-muted-foreground">
          <th className="py-2 text-left font-normal">분야</th>
          <th className="py-2 text-right font-normal">소상공인</th>
          <th className="py-2 text-right font-normal">창작자</th>
          <th className="py-2 text-right font-normal">콜라비</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {CATEGORIES.map((c) => (
          <tr key={c}>
            <td className="py-2">{c}</td>
            <td className="py-2 text-right">{pct(REVENUE_SHARE[c].owner)}</td>
            <td className="py-2 text-right">{pct(REVENUE_SHARE[c].creator)}</td>
            <td className="py-2 text-right text-muted-foreground">{PLATFORM_FEE_LABEL}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
