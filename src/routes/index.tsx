import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/AppShell";
import { AppIcon } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "콜라비 — 콜라보할 땐, 콜라비!" },
      { name: "description", content: "동네 소상공인과 창작자가 만나 함께 프로젝트를 만드는 콜라보 플랫폼, 콜라비." },
      { property: "og:title", content: "콜라비 — 콜라보할 땐, 콜라비!" },
      { property: "og:description", content: "내 주변 소상공인·창작자를 지도에서 찾고, 전자계약으로 안전하게 콜라보하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <PhoneFrame glow>
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-16 text-center">
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <AppIcon />
        </div>
        <h1 className="mt-8 font-display text-5xl">콜라비</h1>
        <p className="mt-3 font-bold text-muted-foreground">콜라보할 땐, 콜라비!</p>
        <Link
          to="/role"
          className="mt-12 flex h-14 w-44 items-center justify-center rounded-2xl bg-brand font-bold text-foreground shadow-soft transition hover:scale-[1.03] active:scale-95"
        >
          시작하기
        </Link>
      </div>
    </PhoneFrame>
  );
}
