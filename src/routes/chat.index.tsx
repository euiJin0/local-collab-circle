import { createFileRoute, Link } from "@tanstack/react-router";
import { AppScreen } from "@/components/AppShell";
import { PartnerAvatar, RoleBadge } from "@/components/PartnerBits";
import { getPartner } from "@/lib/colabi";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "채팅 — 콜라비" },
      { name: "description", content: "콜라보 파트너와 나눈 대화를 확인하세요." },
      { property: "og:title", content: "채팅 — 콜라비" },
      { property: "og:description", content: "콜라보 파트너와 대화하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatList,
});

function ChatList() {
  const { threads } = useStore();
  return (
    <AppScreen title="채팅">
      <ul className="px-3 pb-6">
        {threads.map((t) => {
          const p = getPartner(t.partnerId);
          if (!p) return null;
          const last = t.messages.at(-1);
          return (
            <li key={t.partnerId}>
              <Link to="/chat/$id" params={{ id: p.id }} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-muted">
                <PartnerAvatar p={p} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-bold">{p.name}</p>
                    <RoleBadge role={p.role} />
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{last?.time}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="flex-1 truncate text-sm text-muted-foreground">{last?.text}</p>
                    {t.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary-strong px-1.5 text-[11px] font-bold text-card">{t.unread}</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {threads.length === 0 && <li className="py-20 text-center text-sm text-muted-foreground">아직 대화가 없어요. 탐색에서 파트너에게 말을 걸어보세요!</li>}
      </ul>
    </AppScreen>
  );
}
