import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "동네콜라보 — 소상공인 × 일반인 콜라보 매칭" },
      { name: "description", content: "동네 가게와 크리에이터·일반인이 함께 만드는 콜라보 프로젝트를 찾아보세요." },
      { property: "og:title", content: "동네콜라보" },
      { property: "og:description", content: "동네 가게와 일반인을 잇는 콜라보 매칭 플랫폼" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Post = {
  id: number;
  type: "가게" | "개인";
  author: string;
  area: string;
  category: string;
  title: string;
  desc: string;
  reward: string;
  emoji: string;
};

const INITIAL: Post[] = [
  { id: 1, type: "가게", author: "망원동 소금빵집", area: "마포구", category: "디자인", title: "가게 로고 & 스티커 함께 만들 분", desc: "오픈 3년차 빵집이에요. 새 포장 스티커를 같이 디자인해주실 분을 찾아요.", reward: "빵 한 달 무료 + 30만원", emoji: "🥐" },
  { id: 2, type: "개인", author: "사진 찍는 지은", area: "성동구", category: "사진/영상", title: "동네 가게 인스타 사진 찍어드려요", desc: "포트폴리오를 쌓고 있는 아마추어 사진가입니다. 메뉴·공간 촬영 가능해요.", reward: "포트폴리오 활용 동의", emoji: "📷" },
  { id: 3, type: "가게", author: "연남 꽃집 들꽃", area: "마포구", category: "클래스", title: "주말 원데이 클래스 공동 기획", desc: "꽃 + 캘리그라피 or 향초 클래스를 함께 열 분 구해요. 공간 제공합니다.", reward: "수익 5:5 배분", emoji: "💐" },
  { id: 4, type: "개인", author: "일러스트 민호", area: "관악구", category: "디자인", title: "가게 캐릭터 그려드립니다", desc: "귀여운 캐릭터 작업이 특기예요. 굿즈 콜라보도 환영!", reward: "협의", emoji: "🎨" },
  { id: 5, type: "가게", author: "을지로 노포 커피", area: "중구", category: "사진/영상", title: "가게 소개 숏폼 영상 촬영", desc: "40년 된 다방을 리뉴얼했어요. 우리 이야기를 담아줄 분!", reward: "20만원 + 음료", emoji: "☕" },
  { id: 6, type: "개인", author: "베이킹 덕후 수아", area: "송파구", category: "메뉴개발", title: "시즌 메뉴 레시피 함께 개발해요", desc: "홈베이킹 5년차. 카페와 함께 시즌 디저트를 만들어보고 싶어요.", reward: "판매 수익 일부", emoji: "🍰" },
];

const CATS = ["전체", "디자인", "사진/영상", "클래스", "메뉴개발"];

function Index() {
  const [posts, setPosts] = useState(INITIAL);
  const [tab, setTab] = useState<"전체" | "가게" | "개인">("전체");
  const [cat, setCat] = useState("전체");
  const [applied, setApplied] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "가게" as Post["type"], author: "", title: "", desc: "", category: "디자인", reward: "", area: "" });

  const list = posts.filter((p) => (tab === "전체" || p.type === tab) && (cat === "전체" || p.category === cat));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author || !form.title) return;
    setPosts([{ ...form, id: Date.now(), emoji: form.type === "가게" ? "🏪" : "🙋" }, ...posts]);
    setOpen(false);
    setForm({ ...form, author: "", title: "", desc: "", reward: "", area: "" });
  };

  const input = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-2xl text-primary">동네콜라보</span>
        <button onClick={() => setOpen(true)} className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background">+ 콜라보 제안하기</button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-8">
        <p className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">우리 동네 가게 × 나의 재능</p>
        <h1 className="font-display text-5xl leading-tight md:text-7xl">
          작은 가게와 당신이<br /><span className="text-primary">함께 만드는</span> 이야기
        </h1>
        <p className="mt-5 max-w-xl text-muted-foreground">
          사장님은 필요한 재능을, 일반인은 해보고 싶은 프로젝트를. 디자인·촬영·클래스·메뉴까지 동네에서 콜라보 파트너를 찾아보세요.
        </p>
        <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center">
          {[["128", "참여 가게"], ["340", "참여 개인"], ["76", "성사된 콜라보"]].map(([n, l]) => (
            <div key={l} className="rounded-xl bg-card p-4 shadow-sm">
              <div className="font-display text-3xl text-secondary">{n}</div>
              <div className="text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["전체", "가게", "개인"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {t === "가게" ? "🏪 사장님 제안" : t === "개인" ? "🙋 개인 제안" : "전체"}
            </button>
          ))}
          <span className="mx-2 h-6 w-px bg-border" />
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1.5 text-xs ${cat === c ? "border-secondary bg-secondary text-secondary-foreground" : "bg-card"}`}>{c}</button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const done = applied.includes(p.id);
            return (
              <article key={p.id} className="flex flex-col rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{p.emoji}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.type === "가게" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>{p.type === "가게" ? "사장님" : "개인"} · {p.category}</span>
                </div>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.author} · {p.area || "지역 미정"}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs"><b>보상</b> {p.reward || "협의"}</div>
                <button disabled={done} onClick={() => setApplied([...applied, p.id])} className={`mt-4 rounded-xl py-2.5 text-sm font-bold ${done ? "bg-muted text-muted-foreground" : "bg-foreground text-background hover:bg-primary"}`}>
                  {done ? "✓ 신청 완료 · 연락을 기다려주세요" : "콜라보 신청하기"}
                </button>
              </article>
            );
          })}
          {list.length === 0 && <p className="col-span-full py-16 text-center text-muted-foreground">조건에 맞는 콜라보가 아직 없어요.</p>}
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-3 rounded-2xl bg-card p-6">
            <h2 className="font-display text-2xl">콜라보 제안하기</h2>
            <div className="flex gap-2">
              {(["가게", "개인"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setForm({ ...form, type: t })} className={`flex-1 rounded-lg py-2 text-sm font-bold ${form.type === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t === "가게" ? "🏪 사장님이에요" : "🙋 개인이에요"}</button>
              ))}
            </div>
            <input className={input} placeholder="가게명 / 닉네임" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <input className={input} placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className={input} rows={3} placeholder="어떤 콜라보를 원하나요?" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
            <div className="flex gap-2">
              <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATS.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className={input} placeholder="지역" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            </div>
            <input className={input} placeholder="보상 (예: 20만원, 수익배분)" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} />
            <button className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">등록하기</button>
          </form>
        </div>
      )}
    </div>
  );
}
