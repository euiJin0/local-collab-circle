import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, FolderKanban, MessageCircle, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

/** Phone-width frame used by every screen. */
export function PhoneFrame({ children, glow = false }: { children: ReactNode; glow?: boolean }) {
  return (
    <div className="flex min-h-screen justify-center">
      <div className={`relative flex min-h-screen w-full max-w-[430px] flex-col shadow-card ${glow ? "bg-glow" : "bg-background"}`}>
        {children}
      </div>
    </div>
  );
}

const TABS = [
  { to: "/explore", label: "탐색", icon: Compass },
  { to: "/projects", label: "프로젝트", icon: FolderKanban },
  { to: "/chat", label: "채팅", icon: MessageCircle },
  { to: "/my", label: "마이페이지", icon: UserRound },
] as const;

export function TabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { threads } = useStore();
  const unread = threads.reduce((n, t) => n + t.unread, 0);
  return (
    <nav className="sticky bottom-0 z-30 mt-auto grid grid-cols-4 border-t bg-card/95 px-2 pb-3 pt-2 backdrop-blur">
      {TABS.map(({ to, label, icon: Icon }) => {
        const active = path === to || path.startsWith(`${to}/`);
        return (
          <Link key={to} to={to} className="relative flex flex-col items-center gap-1 py-1 text-[11px] font-medium">
            <span className={`flex h-8 w-14 items-center justify-center rounded-full transition ${active ? "bg-brand" : ""}`}>
              <Icon className={`h-5 w-5 ${active ? "text-foreground" : "text-muted-foreground"}`} />
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            {to === "/chat" && unread > 0 && (
              <span className="absolute right-4 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-strong px-1 text-[10px] font-bold text-card">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppScreen({ children, title, right }: { children: ReactNode; title?: ReactNode; right?: ReactNode }) {
  return (
    <PhoneFrame>
      {title !== undefined && (
        <header className="sticky top-0 z-20 flex items-center justify-between bg-background/90 px-5 pb-3 pt-5 backdrop-blur">
          <h1 className="font-display text-2xl">{title}</h1>
          {right}
        </header>
      )}
      <div className="flex-1">{children}</div>
      <TabBar />
    </PhoneFrame>
  );
}

export function SubHeader({ title, back, right }: { title: string; back: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-3 py-3 backdrop-blur">
      {back}
      <h1 className="flex-1 truncate text-base font-bold">{title}</h1>
      {right}
    </header>
  );
}
