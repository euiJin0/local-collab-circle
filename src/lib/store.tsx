import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Role } from "./colabi";

export type ProjectStatus = "ongoing" | "received" | "sent" | "done";

export type Copyright = "owner" | "creator" | "shared";

export type Contract = {
  title: string;
  scope: string;
  deliverables: string;
  startDate: string;
  endDate: string;
  /** 콜라보 분야 (분야별 수익 배분 비율이 정해짐) */
  category: string;
  /** 예상 콜라보 매출(원) */
  revenue: number;
  revisions: number;
  copyright: Copyright;
  cancelTerms: string;
  proposerName: string;
  partnerName: string;
  proposerSign?: string;
  partnerSign?: string;
  proposerSignedAt?: string;
  partnerSignedAt?: string;
};

export type Project = {
  id: string;
  partnerId: string;
  status: ProjectStatus;
  createdAt: string;
  progress: number;
  contract: Contract;
};

/** 내가 올린 콜라보 글 */
export type Post = {
  id: string;
  title: string;
  category: string;
  skills: string[];
  description: string;
  /** 예상 콜라보 매출(원) */
  amount: number;
  duration: string;
  lookingFor: Role;
  createdAt: string;
  status: "open" | "closed";
};

export type Settings = {
  notifyChat: boolean;
  notifyProposal: boolean;
  notifyMarketing: boolean;
  bank: string;
  account: string;
  area: string;
};

export type Message = { id: string; from: "me" | "them" | "system"; text: string; time: string };
export type Thread = { partnerId: string; messages: Message[]; unread: number };

type Profile = { nickname: string; role: Role | null };

type State = { profile: Profile; projects: Project[]; threads: Thread[]; posts: Post[]; settings: Settings };

const STORAGE_KEY = "colabi-state-v3";

function seed(): State {
  const base = (over: Partial<Contract>): Contract => ({
    title: "",
    scope: "",
    deliverables: "",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    category: "디자인",
    revenue: 0,
    revisions: 2,
    copyright: "shared",
    cancelTerms: "착수 전 취소 시 위약금 없음, 착수 후 취소 시 진행분 정산",
    proposerName: "나",
    partnerName: "",
    ...over,
  });
  return {
    profile: { nickname: "", role: null },
    projects: [
      { id: "pr1", partnerId: "p1", status: "ongoing", createdAt: "2026-10-28", progress: 60, contract: base({ category: "디자인", revenue: 1500000, title: "소금빵 포장 스티커 디자인", scope: "포장 스티커 3종 디자인", deliverables: "AI 원본 파일, 인쇄용 PDF", partnerName: "망원 소금빵집", proposerSign: "signed", partnerSign: "signed", proposerSignedAt: "2026-10-28", partnerSignedAt: "2026-10-29" }) },
      { id: "pr2", partnerId: "p3", status: "ongoing", createdAt: "2026-11-02", progress: 25, contract: base({ title: "꽃 × 캘리 원데이 클래스", scope: "주말 원데이 클래스 2회 공동 운영", deliverables: "클래스 커리큘럼, 홍보 포스터", category: "클래스", revenue: 800000, partnerName: "연남 꽃집 들꽃", proposerSign: "signed", partnerSign: "signed", proposerSignedAt: "2026-11-02", partnerSignedAt: "2026-11-03" }) },
      { id: "pr3", partnerId: "p5", status: "received", createdAt: "2026-11-08", progress: 0, contract: base({ category: "사진/영상", revenue: 1200000, title: "로스팅 과정 숏폼 3편", scope: "로스팅 과정을 담은 30초 숏폼 영상 3편 촬영·편집", deliverables: "세로형 MP4 3편", startDate: "2026-11-15", endDate: "2026-12-05", proposerName: "상수 로스터리 결", partnerName: "나", proposerSign: "signed", proposerSignedAt: "2026-11-08" }) },
      { id: "pr4", partnerId: "p9", status: "received", createdAt: "2026-11-09", progress: 0, contract: base({ title: "독립출판 워크숍 공동 기획", scope: "4주 워크숍 커리큘럼 설계 및 진행", deliverables: "커리큘럼, 참가자 결과물 전시", startDate: "2026-12-01", endDate: "2026-12-28", category: "클래스", revenue: 1000000, proposerName: "당인리 책방 쉼", partnerName: "나", proposerSign: "signed", proposerSignedAt: "2026-11-09" }) },
      { id: "pr5", partnerId: "p7", status: "done", createdAt: "2026-09-12", progress: 100, contract: base({ title: "주말 작가 팝업 마켓", scope: "매장 내 팝업 공간 운영", deliverables: "팝업 2회 진행", startDate: "2026-09-20", endDate: "2026-10-04", category: "공간/팝업", revenue: 900000, partnerName: "망리단 빈티지샵", proposerSign: "signed", partnerSign: "signed" }) },
      { id: "pr6", partnerId: "p9", status: "done", createdAt: "2026-08-03", progress: 100, contract: base({ category: "디자인", revenue: 1000000, title: "책방 북토크 포스터 일러스트", scope: "북토크 홍보 포스터 1종, SNS용 카드 3장", deliverables: "인쇄용 PDF, SNS 이미지", startDate: "2026-08-05", endDate: "2026-08-20", partnerName: "당인리 책방 쉼", proposerSign: "signed", partnerSign: "signed" }) },
      { id: "pr7", partnerId: "p1", status: "done", createdAt: "2026-07-01", progress: 100, contract: base({ category: "디자인", revenue: 1100000, title: "소금빵집 3주년 기념 엽서", scope: "3주년 기념 엽서 2종 일러스트", deliverables: "인쇄용 PDF", startDate: "2026-07-03", endDate: "2026-07-18", partnerName: "망원 소금빵집", proposerSign: "signed", partnerSign: "signed" }) },
    ],
    posts: [
      { id: "po1", title: "가게 캐릭터 · 굿즈 일러스트 해드려요", category: "디자인", skills: ["캐릭터 일러스트", "스티커 굿즈"], description: "가게 분위기에 맞는 캐릭터를 만들어 스티커·엽서 굿즈까지 이어드려요. 시안 2종, 수정 2회 포함이에요.", amount: 1500000, duration: "2주", lookingFor: "owner", createdAt: "2026-11-05", status: "open" },
    ],
    settings: { notifyChat: true, notifyProposal: true, notifyMarketing: false, bank: "", account: "", area: "마포구 망원동" },
    threads: [
      { partnerId: "p1", unread: 2, messages: [
        { id: "m1", from: "them", text: "시안 잘 받았어요! 2번 색감이 정말 좋네요 🥐", time: "오후 2:10" },
        { id: "m2", from: "me", text: "감사해요! 2번으로 디테일 다듬어서 금요일까지 보내드릴게요.", time: "오후 2:14" },
        { id: "m3", from: "them", text: "좋아요. 혹시 스티커 크기도 두 가지로 가능할까요?", time: "오후 3:02" },
      ] },
      { partnerId: "p5", unread: 1, messages: [
        { id: "m4", from: "system", text: "📄 상수 로스터리 결님이 '로스팅 과정 숏폼 3편' 계약서를 보냈어요.", time: "어제" },
        { id: "m5", from: "them", text: "안녕하세요! 영상 콜라보 제안드렸어요. 편하게 보시고 연락 주세요 ☕", time: "어제" },
      ] },
      { partnerId: "p3", unread: 0, messages: [
        { id: "m6", from: "me", text: "클래스 포스터 초안 공유드려요!", time: "월" },
        { id: "m7", from: "them", text: "너무 예뻐요 💐 이대로 진행해요.", time: "월" },
      ] },
    ],
  };
}

type Store = State & {
  hydrated: boolean;
  setProfile: (p: Partial<Profile>) => void;
  addProject: (p: Project) => void;
  updateProject: (id: string, patch: Partial<Omit<Project, "contract">> & { contract?: Partial<Contract> }) => void;
  removeProject: (id: string) => void;
  addPost: (p: Post) => void;
  updatePost: (id: string, patch: Partial<Post>) => void;
  removePost: (id: string) => void;
  setSettings: (p: Partial<Settings>) => void;
  sendMessage: (partnerId: string, text: string, from?: Message["from"]) => void;
  markRead: (partnerId: string) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function nowLabel() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${m}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function newId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => seed());
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...seed(), ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* ignore broken storage */
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setProfile = useCallback((p: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })), []);
  const addProject = useCallback((p: Project) => setState((s) => ({ ...s, projects: [p, ...s.projects] })), []);
  const updateProject = useCallback<Store["updateProject"]>((id, patch) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...patch, contract: { ...p.contract, ...(patch.contract ?? {}) } } : p,
      ),
    }));
  }, []);
  const removeProject = useCallback((id: string) => setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) })), []);
  const addPost = useCallback((p: Post) => setState((s) => ({ ...s, posts: [p, ...s.posts] })), []);
  const updatePost = useCallback((id: string, patch: Partial<Post>) => setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })), []);
  const removePost = useCallback((id: string) => setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) })), []);
  const setSettings = useCallback((p: Partial<Settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } })), []);
  const sendMessage = useCallback((partnerId: string, text: string, from: Message["from"] = "me") => {
    setState((s) => {
      const msg: Message = { id: newId("m"), from, text, time: nowLabel() };
      const exists = s.threads.some((t) => t.partnerId === partnerId);
      const threads = exists
        ? s.threads.map((t) => (t.partnerId === partnerId ? { ...t, messages: [...t.messages, msg] } : t))
        : [{ partnerId, unread: 0, messages: [msg] }, ...s.threads];
      // most recent conversation first
      const idx = threads.findIndex((t) => t.partnerId === partnerId);
      const [moved] = threads.splice(idx, 1);
      return { ...s, threads: moved ? [moved, ...threads] : threads };
    });
  }, []);
  const markRead = useCallback((partnerId: string) => {
    setState((s) => ({ ...s, threads: s.threads.map((t) => (t.partnerId === partnerId ? { ...t, unread: 0 } : t)) }));
  }, []);
  const reset = useCallback(() => setState(seed()), []);

  const value = useMemo<Store>(
    () => ({ ...state, hydrated, setProfile, addProject, updateProject, removeProject, addPost, updatePost, removePost, setSettings, sendMessage, markRead, reset }),
    [state, hydrated, setProfile, addProject, updateProject, removeProject, addPost, updatePost, removePost, setSettings, sendMessage, markRead, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
