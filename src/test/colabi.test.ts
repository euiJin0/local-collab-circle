import { describe, expect, it } from "vitest";
import { COLLAB_TYPES, collabTypeTitle, colabiGrade, colabiScore, GRADES, nextGrade, recommendPartners, ME_LOCATION } from "@/lib/colabi";
import { BREACH_CLAUSE, LEGAL_BASIS, MANUAL_CASES, MANUAL_STEPS } from "@/lib/contractManual";
import { contractMoney, earningsSummary, feeSplit, payModeOf, REVENUE_SHARE, revenueSplit } from "@/lib/money";
import type { Project } from "@/lib/store";

describe("콜라비 지수", () => {
  it("weights 소통 35%, 완료 30% (20건 만점), 평점 20%, 응답률 15%", () => {
    expect(colabiScore({ communication: 100, completed: 20, responseRate: 100, rating: 5 })).toBe(100);
    expect(colabiScore({ communication: 100, completed: 0, responseRate: 0, rating: 0 })).toBe(35);
    expect(colabiScore({ communication: 0, completed: 10, responseRate: 0, rating: 0 })).toBe(15);
    expect(colabiScore({ communication: 0, completed: 0, responseRate: 0, rating: 2.5 })).toBe(10);
    expect(colabiScore({ communication: 0, completed: 0, responseRate: 100, rating: 0 })).toBe(15);
  });

  it("caps completed projects at 20", () => {
    expect(colabiScore({ communication: 0, completed: 50, responseRate: 0, rating: 0 })).toBe(30);
  });

  it("has exactly four grades: 씨앗, 새싹, 성장, 콜라비", () => {
    expect(GRADES.map((g) => g.name)).toEqual(["씨앗", "새싹", "성장", "콜라비"]);
    expect(colabiGrade(39).name).toBe("씨앗");
    expect(colabiGrade(40).name).toBe("새싹");
    expect(colabiGrade(60).name).toBe("성장");
    expect(colabiGrade(80).name).toBe("콜라비");
    expect(nextGrade(80)).toBeUndefined();
    expect(nextGrade(62)?.name).toBe("콜라비");
  });
});

describe("수익 배분 (플랫폼 8% 고정)", () => {
  it("splits by category: owner / creator / platform 8%", () => {
    const expected: Record<string, [number, number]> = {
      디자인: [72, 20],
      "사진/영상": [67, 25],
      클래스: [62, 30],
      메뉴개발: [77, 15],
      "공간/팝업": [67, 25],
      "음악/공연": [57, 35],
    };
    for (const [cat, [owner, creator]] of Object.entries(expected)) {
      expect(revenueSplit(1000000, cat)).toMatchObject({ gross: 1000000, owner: owner * 10000, creator: creator * 10000, fee: 80000 });
    }
    expect(Object.keys(REVENUE_SHARE)).toHaveLength(6);
  });

  it("platform fee is always 8% and the three shares add up to the revenue", () => {
    for (const cat of Object.keys(REVENUE_SHARE)) {
      const s = revenueSplit(123457, cat);
      expect(s.fee).toBe(9877);
      expect(s.owner + s.creator + s.fee).toBe(123457);
    }
  });

  it("lets a custom creator share be proposed while the 8% fee stays fixed", () => {
    expect(revenueSplit(1000000, "디자인", 30)).toMatchObject({ gross: 1000000, owner: 620000, creator: 300000, fee: 80000 });
    expect(revenueSplit(1000000, "디자인", 100)).toMatchObject({ gross: 1000000, owner: 0, creator: 920000, fee: 80000 });
    expect(revenueSplit(1000000, "디자인", -5)).toMatchObject({ gross: 1000000, owner: 920000, creator: 0, fee: 80000 });
    const p = { id: "x", partnerId: "p1", status: "done", createdAt: "", progress: 0, contract: { collabType: "product", amount: 1000000, category: "디자인", creatorPct: 40 } } as unknown as Project;
    expect(earningsSummary([p], "creator").received.net).toBe(400000);
    expect(earningsSummary([p], "owner").received.net).toBe(520000);
  });

  it("sums my share by role: received (완료) and upcoming (진행중)", () => {
    const mk = (status: Project["status"], amount: number, category: string): Project =>
      ({ id: status + amount, partnerId: "p1", status, createdAt: "", progress: 0, contract: { collabType: "product", amount, category } as Project["contract"] }) as Project;
    const list = [mk("done", 1000000, "디자인"), mk("done", 1000000, "음악/공연"), mk("ongoing", 1000000, "클래스")];
    const asCreator = earningsSummary(list, "creator");
    expect(asCreator.received.net).toBe(550000);
    expect(asCreator.received.fee).toBe(160000);
    expect(asCreator.upcoming.net).toBe(300000);
    const asOwner = earningsSummary(list, "owner");
    expect(asOwner.received.net).toBe(1290000);
    expect(asOwner.upcoming.net).toBe(620000);
  });
});

describe("정산 방식: 판매형만 매출 배분, 나머지는 소상공인이 금액 제안", () => {
  it("only 상품·서비스 개발 splits revenue", () => {
    expect(payModeOf("product")).toBe("split");
    expect(payModeOf("promo")).toBe("fee");
    expect(payModeOf("space")).toBe("fee");
    expect(payModeOf("event")).toBe("fee");
    expect(payModeOf(["promo", "product"])).toBe("split");
    expect(payModeOf(["promo", "event"])).toBe("fee");
  });

  it("non-selling collab: owner pays the proposed amount, creator gets it minus the fixed 8% fee", () => {
    expect(feeSplit(500000)).toMatchObject({ mode: "fee", gross: 500000, ownerPays: 500000, fee: 40000, creator: 460000, owner: 0 });
  });

  it("ignores the category ratio for non-selling collabs", () => {
    const c = { collabType: "promo", amount: 500000, category: "음악/공연", creatorPct: 10 } as Project["contract"];
    expect(contractMoney(c).creator).toBe(460000);
  });

  it("counts owner payouts separately from owner earnings", () => {
    const p = { id: "y", partnerId: "p5", status: "done", createdAt: "", progress: 100, contract: { collabType: "promo", amount: 500000, category: "사진/영상" } } as unknown as Project;
    expect(earningsSummary([p], "creator").received.net).toBe(460000);
    expect(earningsSummary([p], "owner").received.net).toBe(0);
    expect(earningsSummary([p], "owner").received.paid).toBe(500000);
  });
});

describe("근처 추천", () => {
  it("recommends only the opposite role", () => {
    const recs = recommendPartners("creator", ME_LOCATION, 10);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.partner.role === "owner")).toBe(true);
  });
});

describe("협업유형", () => {
  it("has the four types the platform uses", () => {
    expect(COLLAB_TYPES.map((t) => t.name)).toEqual(["홍보 콘텐츠", "상품·서비스 개발", "공간·매장 개선", "이벤트·경험 기획"]);
  });

  it("owners pick 필요한 협업유형, creators pick 도울 수 있는 협업유형", () => {
    expect(collabTypeTitle("owner")).toBe("필요한 협업유형");
    expect(collabTypeTitle("creator")).toBe("도울 수 있는 협업유형");
  });

  it("recommends partners whose 협업유형 matches mine first", () => {
    const recs = recommendPartners("creator", ME_LOCATION, 10, ["space"]);
    const firstMiss = recs.findIndex((r) => r.shared.length === 0);
    expect(recs[0]!.partner.collabTypes).toContain("space");
    expect(recs.slice(firstMiss).every((r) => r.shared.length === 0)).toBe(true);
  });
});

describe("계약 파기 방지 매뉴얼", () => {
  it("bases damages claims on 민법 제390조", () => {
    expect(LEGAL_BASIS).toBe("민법 제390조");
    expect(BREACH_CLAUSE).toContain(LEGAL_BASIS);
  });

  it("treats same-day silence as claimable but a bare no-show as hard to sue", () => {
    const lost = MANUAL_CASES.find((m) => m.id === "lost-contact")!;
    const noShow = MANUAL_CASES.find((m) => m.id === "no-show")!;
    expect(lost.canClaim).toBe(true);
    expect(lost.note).toContain("문자");
    expect(noShow.canClaim).toBe(false);
    expect(noShow.note).toContain("소송");
  });
});
