import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { CollabTypePicker } from "@/components/CollabTypes";
import { RevenueBreakdown, ShareProposer } from "@/components/RevenueBreakdown";
import { CATEGORIES, collabTypeTitle, ROLE_LABEL, type CollabTypeId } from "@/lib/colabi";
import { formatWon, parseWon } from "@/lib/money";
import { newId, todayISO, useStore } from "@/lib/store";

export const Route = createFileRoute("/post/new")({
  head: () => ({
    meta: [
      { title: "콜라보 올리기 — 콜라비" },
      { name: "description", content: "쓸 재능과 예상 매출을 정해 동네 파트너에게 콜라보를 올려보세요. 분야별 수익 배분과 받을 금액을 바로 확인할 수 있어요." },
      { property: "og:title", content: "콜라보 올리기 — 콜라비" },
      { property: "og:description", content: "내 재능과 예상 매출을 올리고 받을 수익을 미리 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewPost,
});

const DURATIONS = ["1주 이내", "2주", "1달", "협의"];
const QUICK = [100000, 500000, 1000000];

function NewPost() {
  const { profile, addPost } = useStore();
  const router = useRouter();
  const navigate = useNavigate();
  const isOwner = profile.role === "owner";
  const [title, setTitle] = useState("");
  const [collabTypes, setCollabTypes] = useState<CollabTypeId[]>([]);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [creatorPct, setCreatorPct] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState(DURATIONS[1]!);

  const addSkill = () => {
    const v = skillInput.trim().replace(/^#/, "");
    if (v && !skills.includes(v) && skills.length < 5) setSkills([...skills, v]);
    setSkillInput("");
  };

  const ok = title.trim().length > 0 && collabTypes.length > 0 && skills.length > 0 && description.trim().length > 0 && amount > 0;

  const submit = () => {
    addPost({
      id: newId("po"),
      title: title.trim(),
      collabTypes,
      category,
      skills,
      description: description.trim(),
      amount,
      creatorPct,
      duration,
      lookingFor: isOwner ? "creator" : "owner",
      createdAt: todayISO(),
      status: "open",
    });
    toast.success("콜라보를 올렸어요! 근처 파트너에게 보여져요 🌱");
    navigate({ to: "/my" });
  };

  const field = "w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  const label = "mb-1.5 block text-sm font-bold";

  return (
    <PhoneFrame>
      <SubHeader
        title="콜라보 올리기"
        back={
          <button onClick={() => router.history.back()} aria-label="뒤로" className="rounded-full p-1.5 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
      />
      <div className="flex-1 space-y-5 px-5 pb-32 pt-5">
        <p className="rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
          {profile.role ? `${ROLE_LABEL[profile.role]}로 올려요. ` : ""}올린 글은 근처 {isOwner ? "창작자" : "소상공인"}에게 보여지고, 관심 있는 분이 제안을 보내요.
        </p>

        <div>
          <label className={label} htmlFor="ptitle">제목</label>
          <input id="ptitle" maxLength={50} className={field} placeholder={isOwner ? "예: 빵집 포장 스티커 디자인해 주실 분" : "예: 가게 메뉴 사진 촬영해 드려요"} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <p className={label}>{collabTypeTitle(profile.role)}</p>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {isOwner
              ? "가게에서 함께 풀고 싶은 협업유형을 골라주세요. 여러 개 고를 수 있어요."
              : "내 재능으로 가게를 도울 수 있는 협업유형을 골라주세요. 여러 개 고를 수 있어요."}
          </p>
          <CollabTypePicker multiple value={collabTypes} onChange={setCollabTypes} />
        </div>

        <div>
          <p className={label}>분야</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${category === c ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="skill">{isOwner ? "필요한 재능" : "쓸 재능"}</label>
          <div className="flex gap-2">
            <input
              id="skill"
              maxLength={20}
              className={field}
              placeholder="예: 캐릭터 일러스트"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button type="button" onClick={addSkill} className="shrink-0 rounded-xl bg-foreground px-4 text-sm font-bold text-background">
              추가
            </button>
          </div>
          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold">
                  #{s}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} aria-label={`${s} 삭제`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">최대 5개까지 추가할 수 있어요.</p>
        </div>

        <div>
          <label className={label} htmlFor="pdesc">상세 내용</label>
          <textarea id="pdesc" maxLength={500} rows={4} className={field} placeholder="어떤 콜라보를 하고 싶은지, 포함되는 작업과 결과물을 적어주세요" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <p className={label}>예상 기간</p>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <button key={d} type="button" onClick={() => setDuration(d)} className={`rounded-xl py-2.5 text-xs font-bold ${duration === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={label}>예상 콜라보 매출</p>
          <p className="mb-2 text-[11px] text-muted-foreground">콜라보로 가게에서 생길 것으로 예상되는 매출이에요. 위에서 고른 분야에 따라 나눠요.</p>
          <div className="relative mt-2">
            <input
              aria-label="예상 콜라보 매출(원)"
              inputMode="numeric"
              className={`${field} pr-10 text-right text-lg font-bold`}
              placeholder="0"
              value={amount ? amount.toLocaleString("ko-KR") : ""}
              onChange={(e) => setAmount(Math.min(parseWon(e.target.value), 100000000))}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
          </div>
          <div className="mt-2 flex gap-2">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setAmount((a) => a + q)} className="rounded-full border bg-card px-3 py-1 text-xs">
                +{formatWon(q)}
              </button>
            ))}
            {amount > 0 && (
              <button type="button" onClick={() => setAmount(0)} className="ml-auto text-xs text-muted-foreground underline">
                지우기
              </button>
            )}
          </div>
        </div>

        <ShareProposer category={category} value={creatorPct} onChange={setCreatorPct} />
        <RevenueBreakdown amount={amount} category={category} creatorPct={creatorPct} role={profile.role} />
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t bg-card p-4">
        <button disabled={!ok} onClick={submit} className="h-14 w-full rounded-2xl bg-brand font-bold shadow-soft disabled:opacity-40">
          콜라보 올리기
        </button>
      </div>
    </PhoneFrame>
  );
}
