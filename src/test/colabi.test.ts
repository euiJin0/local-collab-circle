import { describe, expect, it } from "vitest";
import { colabiGrade, colabiScore, GRADES, nextGrade, recommendPartners, ME_LOCATION } from "@/lib/colabi";
import { earningsSummary, REVENUE_SHARE, revenueSplit } from "@/lib/money";
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
      expect(revenueSplit(1000000, cat)).toEqual({ gross: 1000000, owner: owner * 10000, creator: creator * 10000, fee: 80000 });
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
    expect(revenueSplit(1000000, "디자인", 30)).toEqual({ gross: 1000000, owner: 620000, creator: 300000, fee: 80000 });
    expect(revenueSplit(1000000, "디자인", 100)).toEqual({ gross: 1000000, owner: 0, creator: 920000, fee: 80000 });
    expect(revenueSplit(1000000, "디자인", -5)).toEqual({ gross: 1000000, owner: 920000, creator: 0, fee: 80000 });
    const p = { id: "x", partnerId: "p1", status: "done", createdAt: "", progress: 0, contract: { revenue: 1000000, category: "디자인", creatorPct: 40 } } as unknown as Project;
    expect(earningsSummary([p], "creator").received.net).toBe(400000);
    expect(earningsSummary([p], "owner").received.net).toBe(520000);
  });

  it("sums my share by role: received (완료) and upcoming (진행중)", () => {
    const mk = (status: Project["status"], revenue: number, category: string): Project =>
      ({ id: status + revenue, partnerId: "p1", status, createdAt: "", progress: 0, contract: { revenue, category } as Project["contract"] }) as Project;
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

describe("근처 추천", () => {
  it("recommends only the opposite role", () => {
    const recs = recommendPartners("creator", ME_LOCATION, 10);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.partner.role === "owner")).toBe(true);
  });
});
