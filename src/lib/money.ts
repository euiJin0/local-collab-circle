import { CATEGORIES, type Role } from "./colabi";
import type { Project } from "./store";

export type Category = (typeof CATEGORIES)[number];

/** 콜라비 플랫폼 수수료: 모든 분야에서 콜라보 매출의 8%로 고정 */
export const PLATFORM_FEE_RATE = 0.08;
export const PLATFORM_FEE_LABEL = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;

/** 분야별 콜라보 매출 배분 (소상공인 + 창작자 + 플랫폼 8% = 100%) */
export const REVENUE_SHARE: Record<Category, { owner: number; creator: number }> = {
  디자인: { owner: 0.72, creator: 0.2 },
  "사진/영상": { owner: 0.67, creator: 0.25 },
  클래스: { owner: 0.62, creator: 0.3 },
  메뉴개발: { owner: 0.77, creator: 0.15 },
  "공간/팝업": { owner: 0.67, creator: 0.25 },
  "음악/공연": { owner: 0.57, creator: 0.35 },
};

export function shareOf(category: string) {
  return REVENUE_SHARE[category as Category] ?? REVENUE_SHARE["디자인"];
}

export const pct = (rate: number) => `${Math.round(rate * 100)}%`;

export type RevenueSplit = { gross: number; owner: number; creator: number; fee: number };

/** 콜라보 매출 → 소상공인 몫 / 창작자 몫 / 플랫폼 수수료 */
export function revenueSplit(amount: number, category: string): RevenueSplit {
  const gross = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  const fee = Math.round(gross * PLATFORM_FEE_RATE);
  const creator = Math.round(gross * shareOf(category).creator);
  return { gross, owner: gross - fee - creator, creator, fee };
}

/** 내 역할 기준으로 받을 몫 (역할 미선택이면 창작자 기준) */
export function myShare(s: RevenueSplit, role: Role | null): number {
  return role === "owner" ? s.owner : s.creator;
}

export function myRate(category: string, role: Role | null): number {
  const sh = shareOf(category);
  return role === "owner" ? sh.owner : sh.creator;
}

export function formatWon(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

/** "300,000원" 같은 입력에서 숫자만 추출 */
export function parseWon(s: string): number {
  const digits = s.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

type Bucket = { gross: number; fee: number; net: number; count: number };
const empty = (): Bucket => ({ gross: 0, fee: 0, net: 0, count: 0 });

/** 내 역할 기준 수익 요약: net = 콜라보 매출 중 내 몫 */
export function earningsSummary(projects: Project[], role: Role | null) {
  const out = { received: empty(), upcoming: empty(), pending: empty() };
  for (const p of projects) {
    const revenue = p.contract?.revenue;
    if (!revenue) continue;
    const key = p.status === "done" ? "received" : p.status === "ongoing" ? "upcoming" : "pending";
    const s = revenueSplit(revenue, p.contract.category);
    const b = out[key];
    b.gross += s.gross;
    b.fee += s.fee;
    b.net += myShare(s, role);
    b.count += 1;
  }
  return out;
}
