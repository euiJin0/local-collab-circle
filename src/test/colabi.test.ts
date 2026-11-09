import { describe, expect, it } from "vitest";
import { colabiGrade, colabiScore, nextGrade, recommendPartners, ME_LOCATION } from "@/lib/colabi";

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

  it("maps scores to grades 씨앗/새싹/잎새/꽃/열매", () => {
    expect(colabiGrade(39).name).toBe("씨앗");
    expect(colabiGrade(40).name).toBe("새싹");
    expect(colabiGrade(60).name).toBe("잎새");
    expect(colabiGrade(75).name).toBe("꽃");
    expect(colabiGrade(90).name).toBe("열매");
    expect(nextGrade(90)).toBeUndefined();
    expect(nextGrade(62)?.name).toBe("꽃");
  });
});

describe("근처 추천", () => {
  it("recommends only the opposite role", () => {
    const recs = recommendPartners("creator", ME_LOCATION, 10);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.partner.role === "owner")).toBe(true);
  });
});
