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

/** 소상공인 + 창작자가 나눠 갖는 몫 (100% − 콜라비 8%) */
export const PARTNER_POOL_PCT = 100 - Math.round(PLATFORM_FEE_RATE * 100);

/** 창작자 몫을 직접 제안할 때 쓸 수 있는 범위(%) */
export function clampCreatorPct(n: number): number {
  return Math.min(PARTNER_POOL_PCT, Math.max(0, Math.round(n)));
}

/**
 * 배분 비율. creatorPct(창작자 %)를 직접 제안했으면 그 값을, 아니면 분야 기본 비율을 써요.
 * 콜라비 8%는 어떤 경우에도 고정이고, 소상공인 몫 = 92% − 창작자 몫.
 */
export function shareOf(category: string, creatorPct?: number) {
  if (creatorPct != null) {
    const c = clampCreatorPct(creatorPct);
    return { owner: (PARTNER_POOL_PCT - c) / 100, creator: c / 100 };
  }
  return REVENUE_SHARE[category as Category] ?? REVENUE_SHARE["디자인"];
}

export function defaultCreatorPct(category: string): number {
  return Math.round(shareOf(category).creator * 100);
}

export const pct = (rate: number) => `${Math.round(rate * 100)}%`;

export type RevenueSplit = { gross: number; owner: number; creator: number; fee: number };

/** 콜라보 매출 → 소상공인 몫 / 창작자 몫 / 플랫폼 수수료 */
export function revenueSplit(amount: number, category: string, creatorPct?: number): RevenueSplit {
  const gross = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  const fee = Math.round(gross * PLATFORM_FEE_RATE);
  const creator = Math.round(gross * shareOf(category, creatorPct).creator);
  return { gross, owner: gross - fee - creator, creator, fee };
}

/** 내 역할 기준으로 받을 몫 (역할 미선택이면 창작자 기준) */
export function myShare(s: RevenueSplit, role: Role | null): number {
  return role === "owner" ? s.owner : s.creator;
}

export function myRate(category: string, role: Role | null, creatorPct?: number): number {
  const sh = shareOf(category, creatorPct);
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
    const s = revenueSplit(revenue, p.contract.category, p.contract.creatorPct);
    const b = out[key];
    b.gross += s.gross;
    b.fee += s.fee;
    b.net += myShare(s, role);
    b.count += 1;
  }
  return out;
}
