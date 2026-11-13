import type { Role } from "@/lib/colabi";
import { CATEGORIES } from "@/lib/colabi";
import { clampCreatorPct, defaultCreatorPct, feeSplit, formatWon, myShare, PARTNER_POOL_PCT, pct, PLATFORM_FEE_LABEL, PLATFORM_FEE_RATE, REVENUE_SHARE, revenueSplit, shareOf, type PayMode } from "@/lib/money";

/** 콜라보 매출 → 소상공인 / 창작자 / 콜라비 수수료 배분 */
export function RevenueBreakdown({
  amount,
  category,
  role,
  creatorPct,
  label = "예상 콜라보 매출",
}: {
  amount: number;
  category: string;
  role: Role | null;
  creatorPct?: number | undefined;
  label?: string;
}) {
  const s = revenueSplit(amount, category, creatorPct);
  const sh = shareOf(category, creatorPct);
  const custom = creatorPct != null;
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
        콜라보 매출은 소상공인 가게에서 생겨요. {custom ? "직접 제안한 비율대로" : `${category} 분야 권장 비율(기본값)대로`} 소상공인 {pct(sh.owner)} · 창작자 {pct(sh.creator)}로 나누고, 콜라비 수수료 {PLATFORM_FEE_LABEL}는 모든 분야에서 똑같아요. 프로젝트가 완료되면 각자 몫이 정산돼요.
      </p>
    </div>
  );
}

/** 금액 제안형: 소상공인이 창작자에게 지급 → 콜라비 수수료 8% 제외 후 창작자 수령 */
export function FeeBreakdown({ amount, role, label = "제안 금액" }: { amount: number; role: Role | null; label?: string }) {
  const s = feeSplit(amount);
  const isOwner = role === "owner";
  return (
    <div className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-bold">{formatWon(s.gross)}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        <li className={`flex items-center justify-between ${isOwner ? "font-bold" : "text-muted-foreground"}`}>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-secondary-strong" />
            소상공인 → 창작자 지급
            {isOwner && <span className="rounded-full bg-card px-1.5 py-0.5 text-[10px]">나</span>}
          </span>
          <span>{formatWon(s.ownerPays)}</span>
        </li>
        <li className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            콜라비 수수료 {pct(PLATFORM_FEE_RATE)} (고정)
          </span>
          <span>−{formatWon(s.fee)}</span>
        </li>
        <li className={`flex items-center justify-between ${!isOwner ? "font-bold" : "text-muted-foreground"}`}>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary-strong" />
            창작자가 받는 금액
            {!isOwner && <span className="rounded-full bg-card px-1.5 py-0.5 text-[10px]">나</span>}
          </span>
          <span>{formatWon(s.creator)}</span>
        </li>
      </ul>
      <div className="mt-2 flex items-end justify-between border-t border-foreground/10 pt-2">
        <span className="font-bold">{isOwner ? "내가 지급할 금액" : "내가 받을 금액"}</span>
        <span className="font-display text-2xl">{formatWon(isOwner ? s.ownerPays : s.creator)}</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        판매가 없는 콜라보라 매출을 나누지 않고, 소상공인이 창작자에게 작업 금액을 지급해요. 콜라비 수수료 {PLATFORM_FEE_LABEL}는 이 금액에서 빠지고, 프로젝트가 완료되면 정산돼요.
      </p>
    </div>
  );
}

/** 정산 방식에 맞는 금액 카드 */
export function MoneyBreakdown({
  mode,
  amount,
  category,
  creatorPct,
  role,
  done = false,
}: {
  mode: PayMode;
  amount: number;
  category: string;
  creatorPct?: number | undefined;
  role: Role | null;
  done?: boolean;
}) {
  return mode === "fee" ? (
    <FeeBreakdown amount={amount} role={role} label={done ? "지급 금액" : "제안 금액"} />
  ) : (
    <RevenueBreakdown amount={amount} category={category} creatorPct={creatorPct} role={role} label={done ? "콜라보 매출" : "예상 콜라보 매출"} />
  );
}

/** 금액 제안형일 때, 왜 매출 배분이 아닌지 알려주는 안내 */
export function PayModeNote({ mode }: { mode: PayMode }) {
  return (
    <p className="rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
      {mode === "split"
        ? "🧁 상품·서비스 개발은 만든 상품을 가게에서 판매하니까, 콜라보 매출을 소상공인과 창작자가 나눠요."
        : "💸 판매가 없는 협업유형이라 매출을 나누지 않아요. 대신 소상공인이 창작자에게 작업 금액을 제안해요. (매출 배분은 상품·서비스 개발에만 적용돼요.)"}
    </p>
  );
}

/** 분야 기본 비율을 쓸지, 창작자 몫을 직접 제안할지 고르는 입력 */
export function ShareProposer({
  category,
  value,
  onChange,
}: {
  category: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const base = defaultCreatorPct(category);
  const custom = value != null;
  const creator = custom ? clampCreatorPct(value) : base;
  const owner = PARTNER_POOL_PCT - creator;
  const tab = (on: boolean) => `rounded-xl py-2.5 text-sm font-bold ${on ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`;
  return (
    <div>
      <p className="mb-1.5 block text-sm font-bold">수익 배분 비율</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={tab(!custom)} onClick={() => onChange(undefined)}>
          권장 비율(기본값)
        </button>
        <button type="button" className={tab(custom)} onClick={() => onChange(base)}>
          비율 직접 제안
        </button>
      </div>
      {custom ? (
        <div className="mt-3 rounded-2xl border bg-card p-4">
          <div className="flex justify-between text-sm font-bold">
            <span>소상공인 {owner}%</span>
            <span>창작자 {creator}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={PARTNER_POOL_PCT}
            step={1}
            value={creator}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label="창작자 몫(%)"
            className="mt-2 w-full accent-[var(--primary-strong)]"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>콜라비 수수료 {PLATFORM_FEE_LABEL}는 고정이라 두 분이 {PARTNER_POOL_PCT}%를 나눠요.</span>
            {creator !== base && (
              <button type="button" onClick={() => onChange(base)} className="shrink-0 underline">
                권장값({base}%)으로
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">직접 제안한 비율은 계약서에 적히고, 상대방이 서명하면 확정돼요.</p>
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {category} 분야 권장 비율(기본값): 소상공인 {owner}% · 창작자 {creator}% · 콜라비 {PLATFORM_FEE_LABEL}. 확정된 비율이 아니라 권장값이라, 두 분이 협의해 "비율 직접 제안"으로 조절할 수 있어요.
        </p>
      )}
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
