export type Role = "creator" | "owner";

export const ROLE_LABEL: Record<Role, string> = {
  creator: "창작자",
  owner: "소상공인",
};

export const CATEGORIES = ["디자인", "사진/영상", "클래스", "메뉴개발", "공간/팝업", "음악/공연"] as const;

export type Partner = {
  id: string;
  role: Role;
  name: string;
  category: string;
  area: string;
  lat: number;
  lng: number;
  intro: string;
  tags: string[];
  emoji: string;
  colabiScore: number;
  completed: number;
};

/** 프로토타입 기준 위치 (마포구 망원동) */
export const ME_LOCATION = { lat: 37.5559, lng: 126.9105, label: "마포구 망원동" };

export const PARTNERS: Partner[] = [
  { id: "p1", role: "owner", name: "망원 소금빵집", category: "디자인", area: "망원동", lat: 37.5563, lng: 126.906, intro: "오픈 3년차 빵집이에요. 새 포장 스티커와 로고를 함께 만들 분을 찾아요.", tags: ["패키지", "로고"], emoji: "🥐", colabiScore: 82, completed: 6 },
  { id: "p2", role: "creator", name: "사진 찍는 지은", category: "사진/영상", area: "합정동", lat: 37.5495, lng: 126.9139, intro: "동네 가게의 메뉴·공간 사진을 따뜻하게 담아요. 인스타 피드 정리도 가능해요.", tags: ["메뉴촬영", "인스타"], emoji: "📷", colabiScore: 76, completed: 9 },
  { id: "p3", role: "owner", name: "연남 꽃집 들꽃", category: "클래스", area: "연남동", lat: 37.5662, lng: 126.925, intro: "꽃 + 캘리그라피 원데이 클래스를 함께 열 분 구해요. 공간 제공합니다.", tags: ["원데이클래스", "공간제공"], emoji: "💐", colabiScore: 88, completed: 11 },
  { id: "p4", role: "creator", name: "일러스트 민호", category: "디자인", area: "서교동", lat: 37.5537, lng: 126.9198, intro: "귀여운 캐릭터 작업이 특기예요. 가게 캐릭터와 굿즈 콜라보 환영!", tags: ["캐릭터", "굿즈"], emoji: "🎨", colabiScore: 91, completed: 17 },
  { id: "p5", role: "owner", name: "상수 로스터리 결", category: "사진/영상", area: "상수동", lat: 37.5477, lng: 126.9229, intro: "로스팅 과정을 담은 숏폼 영상을 찍어줄 분을 찾고 있어요.", tags: ["숏폼", "브랜딩"], emoji: "☕", colabiScore: 70, completed: 4 },
  { id: "p6", role: "creator", name: "베이킹 덕후 수아", category: "메뉴개발", area: "성산동", lat: 37.5665, lng: 126.9089, intro: "홈베이킹 5년차. 카페와 시즌 디저트를 함께 개발하고 싶어요.", tags: ["디저트", "시즌메뉴"], emoji: "🍰", colabiScore: 64, completed: 3 },
  { id: "p7", role: "owner", name: "망리단 빈티지샵", category: "공간/팝업", area: "망원동", lat: 37.558, lng: 126.903, intro: "주말에 매장 한쪽을 작가 팝업 공간으로 내드려요.", tags: ["팝업", "플리마켓"], emoji: "🧥", colabiScore: 79, completed: 8 },
  { id: "p8", role: "creator", name: "어쿠스틱 듀오 온", category: "음악/공연", area: "연희동", lat: 37.568, lng: 126.931, intro: "작은 공간에서 하는 어쿠스틱 공연을 좋아해요. 가게 음악회 함께해요.", tags: ["라이브", "버스킹"], emoji: "🎸", colabiScore: 73, completed: 5 },
  { id: "p9", role: "owner", name: "당인리 책방 쉼", category: "클래스", area: "당인동", lat: 37.545, lng: 126.918, intro: "독립출판 워크숍을 같이 기획할 작가님을 찾아요.", tags: ["워크숍", "독립출판"], emoji: "📚", colabiScore: 85, completed: 10 },
  { id: "p10", role: "creator", name: "캘리그라퍼 하린", category: "클래스", area: "망원동", lat: 37.5548, lng: 126.9078, intro: "손글씨 간판·메뉴판 작업과 캘리 클래스를 진행해요.", tags: ["메뉴판", "캘리"], emoji: "✒️", colabiScore: 94, completed: 22 },
];

export function getPartner(id: string): Partner | undefined {
  return PARTNERS.find((p) => p.id === id);
}

type LatLng = { lat: number; lng: number };

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

/** 내 역할과 반대 역할의 파트너를 거리와 콜라비 지수로 추천 */
export function recommendPartners(myRole: Role | null, from: LatLng, limit = 5) {
  return PARTNERS.filter((p) => !myRole || p.role !== myRole)
    .map((p) => {
      const km = distanceKm(from, p);
      const match = Math.round((p.colabiScore / 100) * 50 + (1 - Math.min(km, 3) / 3) * 50);
      return { partner: p, km, match };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, limit);
}

/* ---------- 콜라비 지수 ---------- */

export type ColabiStats = {
  /** 소통 점수 0~100 */
  communication: number;
  /** 완료한 프로젝트 수 */
  completed: number;
  /** 응답률 0~100 */
  responseRate: number;
  /** 평균 평점 0~5 */
  rating: number;
};

export const COMPLETED_FOR_MAX = 20;

export const COLABI_WEIGHTS = {
  communication: 0.35,
  completed: 0.3,
  responseRate: 0.15,
  rating: 0.2,
} as const;

export type Grade = { name: string; min: number; emoji: string; desc: string };

export const GRADES: Grade[] = [
  { name: "씨앗", min: 0, emoji: "🌰", desc: "콜라비를 막 시작했어요" },
  { name: "새싹", min: 40, emoji: "🌱", desc: "첫 콜라보를 키워가는 중" },
  { name: "잎새", min: 60, emoji: "🍃", desc: "믿고 함께하는 파트너" },
  { name: "꽃", min: 75, emoji: "🌸", desc: "동네에서 인정받는 콜라버" },
  { name: "열매", min: 90, emoji: "🍇", desc: "최고의 콜라보 메이커" },
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** 항목별 0~100 점수 */
export function colabiBreakdown(s: ColabiStats) {
  return {
    communication: clamp(s.communication, 0, 100),
    completed: (clamp(s.completed, 0, COMPLETED_FOR_MAX) / COMPLETED_FOR_MAX) * 100,
    responseRate: clamp(s.responseRate, 0, 100),
    rating: (clamp(s.rating, 0, 5) / 5) * 100,
  };
}

export function colabiScore(s: ColabiStats): number {
  const b = colabiBreakdown(s);
  const total =
    b.communication * COLABI_WEIGHTS.communication +
    b.completed * COLABI_WEIGHTS.completed +
    b.responseRate * COLABI_WEIGHTS.responseRate +
    b.rating * COLABI_WEIGHTS.rating;
  return Math.round(total);
}

export function colabiGrade(score: number): Grade {
  let g = GRADES[0]!;
  for (const grade of GRADES) if (score >= grade.min) g = grade;
  return g;
}

export function nextGrade(score: number): Grade | undefined {
  return GRADES.find((g) => g.min > score);
}

export function gradeForPartner(p: Partner) {
  return colabiGrade(p.colabiScore);
}
