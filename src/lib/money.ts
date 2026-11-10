import type { Project } from "./store";

/** 콜라비 플랫폼 수수료: 대금을 받는 쪽의 정산 금액에서 차감 */
export const PLATFORM_FEE_RATE = 0.08;
export const PLATFORM_FEE_LABEL = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;

export type FeeSplit = { gross: number; fee: number; net: number };

export function feeSplit(amount: number): FeeSplit {
  const gross = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  const fee = Math.round(gross * PLATFORM_FEE_RATE);
  return { gross, fee, net: gross - fee };
}

export function formatWon(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

/** "300,000원" 같은 입력에서 숫자만 추출 */
export function parseWon(s: string): number {
  const digits = s.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

type Bucket = FeeSplit & { count: number };
const empty = (): Bucket => ({ gross: 0, fee: 0, net: 0, count: 0 });

/** 내가 받는(payee = me) 금액 기준 수익 요약 */
export function earningsSummary(projects: Project[]) {
  const out = { received: empty(), upcoming: empty(), pending: empty() };
  for (const p of projects) {
    if (p.payee !== "me" || !p.amount) continue;
    const key = p.status === "done" ? "received" : p.status === "ongoing" ? "upcoming" : "pending";
    const s = feeSplit(p.amount);
    const b = out[key];
    b.gross += s.gross;
    b.fee += s.fee;
    b.net += s.net;
    b.count += 1;
  }
  return out;
}
