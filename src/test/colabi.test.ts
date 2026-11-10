import { describe, expect, it } from "vitest";
import { colabiGrade, colabiScore, GRADES, nextGrade, recommendPartners, ME_LOCATION } from "@/lib/colabi";
import { earningsSummary, feeSplit } from "@/lib/money";
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

describe("플랫폼 수수료 8%", () => {
  it("takes 8% from the amount the receiver gets", () => {
    expect(feeSplit(300000)).toEqual({ gross: 300000, fee: 24000, net: 276000 });
    expect(feeSplit(0)).toEqual({ gross: 0, fee: 0, net: 0 });
  });

  it("sums received (완료) and upcoming (진행중) earnings only for money I receive", () => {
    const mk = (status: Project["status"], amount: number, payee: "me" | "partner"): Project =>
      ({ id: status + amount, partnerId: "p1", status, createdAt: "", progress: 0, amount, payee, contract: {} as Project["contract"] }) as Project;
    const s = earningsSummary([mk("done", 100000, "me"), mk("done", 50000, "partner"), mk("ongoing", 200000, "me")]);
    expect(s.received.net).toBe(92000);
    expect(s.received.fee).toBe(8000);
    expect(s.upcoming.net).toBe(184000);
  });
});

describe("근처 추천", () => {
  it("recommends only the opposite role", () => {
    const recs = recommendPartners("creator", ME_LOCATION, 10);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.partner.role === "owner")).toBe(true);
  });
});
