import type { Role } from "@/lib/colabi";
import { CATEGORIES } from "@/lib/colabi";
import { clampCreatorPct, defaultCreatorPct, formatWon, myShare, PARTNER_POOL_PCT, pct, PLATFORM_FEE_LABEL, PLATFORM_FEE_RATE, REVENUE_SHARE, revenueSplit, shareOf } from "@/lib/money";

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
