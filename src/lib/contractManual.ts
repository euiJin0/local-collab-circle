/**
 * 계약 중 파기·불이행이 일어나지 않도록, 사전에 합의해 두는 대응 매뉴얼.
 * 전자계약서 하단 "주의 사항"에 그대로 인쇄된다.
 */

/** 채무불이행(이행불능)에 따른 손해배상 근거 */
export const LEGAL_BASIS = "민법 제390조";

export type ManualCase = {
  id: "lost-contact" | "no-show";
  /** 어떤 상황인지 */
  situation: string;
  /** 이 상황에서 손해배상 청구가 가능한지 */
  canClaim: boolean;
  /** 왜 그런지, 무엇을 해야 하는지 */
  note: string;
};

/**
 * 두 경우를 구분하는 것이 이 매뉴얼의 핵심이다.
 * - 당일 연락 두절: 함께 나눈 문자·채팅 기록이 있으면 민사상 손해배상 청구 가능
 * - 단순 불참: 불참 사실만으로는 소송이 어려울 수 있음
 */
export const MANUAL_CASES: ManualCase[] = [
  {
    id: "lost-contact",
    situation: "당일에 연락이 두절된 경우",
    canClaim: true,
    note: "함께 나눈 문자·채팅 기록(일정·작업 범위·금액이 합의된 내역)이 있으면 민사상 손해배상을 청구할 수 있어요.",
  },
  {
    id: "no-show",
    situation: "단순히 약속 장소에 나오지 않은 경우",
    canClaim: false,
    note: "불참 사실만으로는 손해·인과관계 입증이 어려워 소송이 어려울 수 있어요. 불참한 즉시 문자·사진으로 확인해 두세요.",
  },
];

export type ManualStep = { title: string; detail: string };

/** 계약 전에 미리 합의해 두는 순서 */
export const MANUAL_STEPS: ManualStep[] = [
  {
    title: "기록 남기기",
    detail: "일정·작업 범위·금액을 채팅이나 문자로 확정하고 캡처해 보관해요. 구두로 약속한 내용도 문자로 한 번 더 확인해요.",
  },
  {
    title: "연락 시도 기록",
    detail: "당일 연락이 두절되면 같은 날 문자·전화로 3회 연락하고, 시도 시각을 그대로 남겨요.",
  },
  {
    title: "기한 정해 최고",
    detail: "문자나 내용증명으로 '언제까지 이행해 달라'는 기한을 정해 요청해요. 기한을 넘기면 해제·위약금 근거가 돼요.",
  },
  {
    title: "증거 정리",
    detail: "함께 나눈 문자·채팅 기록, 지출 영수증, 예상 매출 근거를 한 번에 모아요.",
  },
  {
    title: "중재 → 청구",
    detail: "콜라비 중재로 우선 협의하고, 협의가 안 되면 위 기록을 근거로 손해배상을 청구해요.",
  },
];

/** 조항 한 줄에 들어갈 문구 */
export const BREACH_CLAUSE = `계약 중 파기·불이행이 생기면 아래 "계약 파기 방지 매뉴얼"에 따라 기록을 남기고, ${LEGAL_BASIS}를 기준으로 협의 → 중재 → 손해배상 순으로 대응합니다.`;

/** 법률 자문이 아니라는 안내 */
export const LEGAL_DISCLAIMER = "본 매뉴얼은 일반적인 안내이며 법률 자문이 아니에요. 금액이 크거나 분쟁이 길어지면 전문가 상담을 권해요.";
