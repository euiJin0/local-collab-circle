import { feeSplit, formatWon, PLATFORM_FEE_LABEL } from "@/lib/money";

/** 제안 금액 → 수수료 8% → 받을 금액 */
export function FeeBreakdown({ amount, payee }: { amount: number; payee: "me" | "partner" }) {
  const s = feeSplit(amount);
  const receiver = payee === "me" ? "내가 받을 금액" : "파트너가 받을 금액";
  return (
    <div className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
      <div className="flex justify-between">
        <span>{payee === "me" ? "제안 금액" : "내가 지급할 금액"}</span>
        <span className="font-bold">{formatWon(s.gross)}</span>
      </div>
      <div className="mt-1.5 flex justify-between text-muted-foreground">
        <span>콜라비 플랫폼 수수료 ({PLATFORM_FEE_LABEL})</span>
        <span>−{formatWon(s.fee)}</span>
      </div>
      <div className="mt-2 flex items-end justify-between border-t border-foreground/10 pt-2">
        <span className="font-bold">{receiver}</span>
        <span className="font-display text-2xl">{formatWon(s.net)}</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        콜라비는 거래 금액의 {PLATFORM_FEE_LABEL}를 수수료로 가져가요. 수수료는 대금을 받는 분의 정산 금액에서 빠지고, 프로젝트가 완료되면 나머지가 정산돼요.
      </p>
    </div>
  );
}
