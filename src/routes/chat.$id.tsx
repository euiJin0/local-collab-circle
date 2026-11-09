import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ChevronLeft, FileSignature, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { PartnerAvatar } from "@/components/PartnerBits";
import { getPartner } from "@/lib/colabi";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/chat/$id")({
  loader: ({ params }) => {
    const partner = getPartner(params.id);
    if (!partner) throw notFound();
    return { partner };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.partner.name}와의 채팅 — 콜라비` : "채팅 — 콜라비";
    return {
      meta: [
        { title },
        { name: "description", content: "콜라보 파트너와 실시간으로 이야기하세요." },
        { property: "og:title", content: title },
        { property: "og:description", content: "콜라보 파트너와 대화하세요." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ChatRoom,
});

const REPLIES = [
  "좋아요! 조금 더 자세히 이야기 나눠봐요 😊",
  "확인했어요. 일정 맞춰볼게요!",
  "오 재밌겠네요. 제안서로 보내주시면 검토해볼게요.",
  "감사합니다! 내일 다시 연락드릴게요.",
];

function ChatRoom() {
  const { partner: p } = Route.useLoaderData();
  const { threads, sendMessage, markRead } = useStore();
  const router = useRouter();
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const thread = threads.find((t) => t.partnerId === p.id);
  const messages = thread?.messages ?? [];

  useEffect(() => {
    markRead(p.id);
  }, [p.id, markRead, messages.length]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim().slice(0, 500);
    if (!t) return;
    sendMessage(p.id, t);
    setText("");
    const reply = REPLIES[messages.length % REPLIES.length]!;
    window.setTimeout(() => sendMessage(p.id, reply, "them"), 1200);
  };

  return (
    <PhoneFrame>
      <SubHeader
        title={p.name}
        back={
          <button onClick={() => router.history.back()} aria-label="뒤로" className="rounded-full p-1.5 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
        right={
          <Link to="/propose/$id" params={{ id: p.id }} className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold">
            <FileSignature className="h-3.5 w-3.5" /> 제안하기
          </Link>
        }
      />
      <div className="flex-1 space-y-3 px-4 py-4">
        <Link to="/partner/$id" params={{ id: p.id }} className="mx-auto flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <PartnerAvatar p={p} size="h-5 w-5 text-xs rounded-md" /> {p.category} · {p.area} · 프로필 보기
        </Link>
        {messages.map((m) =>
          m.from === "system" ? (
            <p key={m.id} className="mx-auto max-w-[85%] rounded-xl bg-accent px-3 py-2 text-center text-xs text-accent-foreground">
              {m.text}
            </p>
          ) : (
            <div key={m.id} className={`flex items-end gap-1.5 ${m.from === "me" ? "flex-row-reverse" : ""}`}>
              <p className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md bg-card shadow-card"}`}>
                {m.text}
              </p>
              <span className="text-[10px] text-muted-foreground">{m.time}</span>
            </div>
          ),
        )}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="sticky bottom-0 flex items-center gap-2 border-t bg-card p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="메시지를 입력하세요"
          aria-label="메시지 입력"
          className="h-11 flex-1 rounded-full bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button aria-label="보내기" disabled={!text.trim()} className="flex h-11 w-11 items-center justify-center rounded-full bg-brand disabled:opacity-40">
          <SendHorizonal className="h-5 w-5" />
        </button>
      </form>
    </PhoneFrame>
  );
}
