import { CATEGORIES, type CollabTypeId, type Role } from "./colabi";
import type { Contract, Post, Project } from "./store";

export type Category = (typeof CATEGORIES)[number];

/** 콜라비 플랫폼 수수료: 모든 콜라보에서 8%로 고정 (매출 배분형은 매출의, 금액 제안형은 제안 금액의 8%) */
export const PLATFORM_FEE_RATE = 0.08;
export const PLATFORM_FEE_LABEL = `${Math.round(PLATFORM_FEE_RATE * 100)}%`;

/**
 * 정산 방식
 * - split: 판매가 일어나는 콜라보 — 소상공인 가게에서 생긴 매출을 소상공인·창작자가 나눠요.
 * - fee:   판매가 없는 콜라보 — 소상공인이 창작자에게 작업 금액을 제안해 지급해요.
 */
export type PayMode = "split" | "fee";

/** 판매로 매출이 생기는 협업유형 (상품·서비스 개발만 해당) */
export const SALES_COLLAB_TYPES: readonly CollabTypeId[] = ["product"];

/** 협업유형으로 정산 방식을 정해요. 여러 개 중 판매형이 하나라도 있으면 매출 배분이에요. */
export function payModeOf(types: CollabTypeId | readonly CollabTypeId[] | undefined | null): PayMode {
  const list = types == null ? [] : typeof types === "string" ? [types] : types;
  return list.some((t) => SALES_COLLAB_TYPES.includes(t)) ? "split" : "fee";
}

/** 분야별 콜라보 매출 배분 (소상공인 + 창작자 + 플랫폼 8% = 100%) — 매출 배분형에만 적용 */
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

export type RevenueSplit = {
  mode: PayMode;
  /** 매출 배분형: 콜라보 매출 / 금액 제안형: 소상공인이 제안한 금액 */
  gross: number;
  /** 소상공인이 받는 몫 (금액 제안형은 0) */
  owner: number;
  /** 창작자가 받는 몫 */
  creator: number;
  /** 콜라비 수수료 */
  fee: number;
  /** 소상공인이 창작자에게 지급하는 금액 (매출 배분형은 0) */
  ownerPays: number;
  ownerRate: number;
  creatorRate: number;
};

const toWon = (amount: number) => (Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0);

/** 매출 배분형: 콜라보 매출 → 소상공인 몫 / 창작자 몫 / 플랫폼 수수료 */
export function revenueSplit(amount: number, category: string, creatorPct?: number): RevenueSplit {
  const gross = toWon(amount);
  const sh = shareOf(category, creatorPct);
  const fee = Math.round(gross * PLATFORM_FEE_RATE);
  const creator = Math.round(gross * sh.creator);
  return { mode: "split", gross, owner: gross - fee - creator, creator, fee, ownerPays: 0, ownerRate: sh.owner, creatorRate: sh.creator };
}

/** 금액 제안형: 소상공인이 제안 금액을 지급 → 콜라비 수수료 8%를 뺀 금액을 창작자가 받아요 */
export function feeSplit(amount: number): RevenueSplit {
  const gross = toWon(amount);
  const fee = Math.round(gross * PLATFORM_FEE_RATE);
  return { mode: "fee", gross, owner: 0, creator: gross - fee, fee, ownerPays: gross, ownerRate: 0, creatorRate: 1 - PLATFORM_FEE_RATE };
}

export function collabMoney(amount: number, mode: PayMode, category: string, creatorPct?: number): RevenueSplit {
  return mode === "fee" ? feeSplit(amount) : revenueSplit(amount, category, creatorPct);
}

export function contractMoney(c: Pick<Contract, "amount" | "category" | "creatorPct" | "collabType">): RevenueSplit {
  return collabMoney(c.amount, payModeOf(c.collabType), c.category, c.creatorPct);
}

export function postMoney(p: Pick<Post, "amount" | "category" | "creatorPct" | "collabTypes">): RevenueSplit {
  return collabMoney(p.amount, payModeOf(p.collabTypes), p.category, p.creatorPct);
}

/** 내 역할 기준으로 받을 몫 (역할 미선택이면 창작자 기준) */
export function myShare(s: RevenueSplit, role: Role | null): number {
  return role === "owner" ? s.owner : s.creator;
}

export function myRate(s: RevenueSplit, role: Role | null): number {
  return role === "owner" ? s.ownerRate : s.creatorRate;
}

export function formatWon(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

/** "300,000원" 같은 입력에서 숫자만 추출 */
export function parseWon(s: string): number {
  const digits = s.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

/** net = 내가 받을 몫, paid = 소상공인이 창작자에게 지급할 금액(금액 제안형) */
type Bucket = { gross: number; fee: number; net: number; paid: number; count: number };
const empty = (): Bucket => ({ gross: 0, fee: 0, net: 0, paid: 0, count: 0 });

/** 내 역할 기준 수익 요약 */
export function earningsSummary(projects: Project[], role: Role | null) {
  const out = { received: empty(), upcoming: empty(), pending: empty() };
  for (const p of projects) {
    if (!p.contract?.amount) continue;
    const key = p.status === "done" ? "received" : p.status === "ongoing" ? "upcoming" : "pending";
    const s = contractMoney(p.contract);
    const b = out[key];
    b.gross += s.gross;
    b.fee += s.fee;
    b.net += myShare(s, role);
    if (role === "owner") b.paid += s.ownerPays;
    b.count += 1;
  }
  return out;
}
