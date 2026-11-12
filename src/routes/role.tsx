import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Palette, Store } from "lucide-react";
import { useState } from "react";
import { PhoneFrame } from "@/components/AppShell";
import { LogoMark } from "@/components/Logo";
import type { Role } from "@/lib/colabi";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/role")({
  head: () => ({
    meta: [
      { title: "역할 선택 — 콜라비" },
      { name: "description", content: "창작자인지 소상공인인지 선택하고 콜라비를 시작하세요." },
      { property: "og:title", content: "역할 선택 — 콜라비" },
      { property: "og:description", content: "창작자 또는 소상공인으로 콜라비를 시작하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RolePage,
});

const OPTIONS: { role: Role; title: string; desc: string; icon: typeof Palette; examples: string }[] = [
  { role: "creator", title: "창작자예요", desc: "내 재능으로 동네 가게와 프로젝트를 하고 싶어요", icon: Palette, examples: "디자인 · 사진 · 영상 · 공연 · 클래스" },
  { role: "owner", title: "소상공인이에요", desc: "우리 가게와 함께할 창작자를 찾고 있어요", icon: Store, examples: "카페 · 베이커리 · 꽃집 · 책방 · 편집숍" },
];

function RolePage() {
  const { profile, setProfile } = useStore();
  const [role, setRole] = useState<Role | null>(profile.role);
  const [nickname, setNickname] = useState(profile.nickname);
  const navigate = useNavigate();

  const start = () => {
    if (!role) return;
    setProfile({ role, nickname: nickname.trim().slice(0, 20) || (role === "creator" ? "새 창작자" : "새 사장님") });
    navigate({ to: "/explore" });
  };

  return (
    <PhoneFrame glow>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-12">
        <LogoMark className="h-11 w-11" />
        <h1 className="mt-5 font-display text-3xl leading-snug">
          콜라비에서
          <br />
          어떤 역할로 함께할까요?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">역할에 맞는 파트너를 추천해 드려요. 나중에 마이페이지에서 바꿀 수 있어요.</p>

        <div className="mt-8 space-y-3">
          {OPTIONS.map(({ role: r, title, desc, icon: Icon, examples }) => {
            const on = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={on}
                className={`flex w-full items-start gap-4 rounded-2xl border-2 bg-card p-5 text-left transition ${on ? "border-foreground shadow-soft" : "border-transparent shadow-card"}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r === "creator" ? "bg-primary" : "bg-secondary"}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold">{title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>
                  <span className="mt-2 block text-xs text-muted-foreground">{examples}</span>
                </span>
                <span className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? "border-foreground bg-foreground" : ""}`}>
                  {on && <Check className="h-4 w-4 text-card" />}
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-6 block text-sm font-bold" htmlFor="nick">
          {role === "owner" ? "가게 이름" : "활동명"} <span className="font-normal text-muted-foreground">(선택)</span>
        </label>
        <input
          id="nick"
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={role === "owner" ? "예: 망원 소금빵집" : "예: 동네 일러스트 작가"}
          className="mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="button"
          disabled={!role}
          onClick={start}
          className="mt-auto h-14 w-full rounded-2xl bg-brand font-bold shadow-soft transition disabled:opacity-40"
        >
          콜라비 시작하기
        </button>
      </div>
    </PhoneFrame>
  );
}
