import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { ContractDocument, COPYRIGHT_LABEL } from "@/components/ContractDocument";
import { PartnerAvatar } from "@/components/PartnerBits";
import { RevenueBreakdown } from "@/components/RevenueBreakdown";
import { SignaturePad } from "@/components/SignaturePad";
import { CATEGORIES, getPartner } from "@/lib/colabi";
import { parseWon } from "@/lib/money";
import { newId, todayISO, useStore, type Contract, type Copyright } from "@/lib/store";

export const Route = createFileRoute("/propose/$id")({
  loader: ({ params }) => {
    const partner = getPartner(params.id);
    if (!partner) throw notFound();
    return { partner };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.partner.name}에게 콜라보 제안 — 콜라비` : "콜라보 제안 — 콜라비";
    return {
      meta: [
        { title },
        { name: "description", content: "콜라보 내용과 조건을 정하고 전자계약서로 제안하세요." },
        { property: "og:title", content: title },
        { property: "og:description", content: "전자계약서로 안전하게 콜라보를 제안하세요." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProposePage,
});

const STEPS = ["프로젝트 내용", "협업 조건", "계약서 서명"];

function ProposePage() {
  const { partner } = Route.useLoaderData();
  const { profile, addProject, sendMessage } = useStore();
  const router = useRouter();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(false);
  const [sign, setSign] = useState<string | null>(null);
  const [c, setC] = useState<Contract>(() => ({
    title: "",
    scope: "",
    deliverables: "",
    startDate: todayISO(),
    endDate: todayISO(),
    category: (CATEGORIES as readonly string[]).includes(partner.category) ? partner.category : CATEGORIES[0],
    revenue: 0,
    revisions: 2,
    copyright: "shared",
    cancelTerms: "착수 전 취소 시 위약금 없음, 착수 후 취소 시 진행분 정산",
    proposerName: profile.nickname || "나",
    partnerName: partner.name,
  }));
  const set = <K extends keyof Contract>(k: K, v: Contract[K]) => setC((s) => ({ ...s, [k]: v }));

  const step0ok = c.title.trim().length > 0 && c.scope.trim().length > 0;
  const step1ok = c.endDate >= c.startDate && c.revenue > 0;
  const canNext = step === 0 ? step0ok : step === 1 ? step1ok : agree && !!sign;

  const submit = () => {
    const id = newId("pr");
    addProject({
      id,
      partnerId: partner.id,
      status: "sent",
      createdAt: todayISO(),
      progress: 0,
      contract: { ...c, proposerSign: sign ?? undefined, proposerSignedAt: todayISO() } as Contract,
    });
    sendMessage(partner.id, `📄 '${c.title}' 콜라보 계약서를 보냈어요. 확인 후 서명해 주세요!`, "system");
    toast.success("계약서와 함께 제안을 보냈어요");
    navigate({ to: "/projects", search: { tab: "sent" } });
  };

  const field = "w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  const label = "mb-1.5 block text-sm font-bold";

  return (
    <PhoneFrame>
      <SubHeader
        title="콜라보 제안 · 전자계약"
        back={
          <button
            onClick={() => (step === 0 ? router.history.back() : setStep(step - 1))}
            aria-label="뒤로"
            className="rounded-full p-1.5 hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
      />
      <div className="px-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
          <PartnerAvatar p={partner} size="h-10 w-10 text-lg" />
          <p className="text-sm">
            <b>{partner.name}</b>님에게 제안해요
          </p>
        </div>
        <ol className="mt-4 flex gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-muted"}`} />
              <p className={`mt-1.5 text-[11px] ${i === step ? "font-bold" : "text-muted-foreground"}`}>
                {i + 1}. {s}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex-1 space-y-4 px-5 pb-32 pt-5">
        {step === 0 && (
          <>
            <div>
              <label className={label} htmlFor="title">프로젝트명</label>
              <input id="title" maxLength={50} className={field} placeholder="예: 가게 포장 스티커 디자인" value={c.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="scope">작업 범위</label>
              <textarea id="scope" maxLength={500} rows={4} className={field} placeholder="어떤 작업을 함께하고 싶은지 자세히 적어주세요" value={c.scope} onChange={(e) => set("scope", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="deliv">결과물</label>
              <input id="deliv" maxLength={200} className={field} placeholder="예: 원본 파일, 인쇄용 PDF" value={c.deliverables} onChange={(e) => set("deliverables", e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label} htmlFor="start">시작일</label>
                <input id="start" type="date" className={field} value={c.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div>
                <label className={label} htmlFor="end">종료일</label>
                <input id="end" type="date" className={field} value={c.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>
            {c.endDate < c.startDate && <p className="text-xs text-destructive">종료일은 시작일 이후여야 해요.</p>}
            <div>
              <p className={label}>창작자가 맡는 분야</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((k) => (
                  <button key={k} type="button" onClick={() => set("category", k)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${c.category === k ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                    {k}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">분야에 따라 소상공인과 창작자의 수익 배분 비율이 정해져요.</p>
            </div>
            <div>
              <label className={label} htmlFor="revenue">예상 콜라보 매출</label>
              <div className="relative">
                <input
                  id="revenue"
                  inputMode="numeric"
                  className={`${field} pr-10 text-right text-lg font-bold`}
                  placeholder="0"
                  value={c.revenue ? c.revenue.toLocaleString("ko-KR") : ""}
                  onChange={(e) => set("revenue", Math.min(parseWon(e.target.value), 1000000000))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">콜라보로 가게에서 생길 것으로 예상되는 매출이에요. 정산은 실제 매출 기준으로 해요.</p>
            </div>
            <RevenueBreakdown amount={c.revenue} category={c.category} role={profile.role} />
            <div>
              <label className={label} htmlFor="rev">수정 횟수: {c.revisions}회</label>
              <input id="rev" type="range" min={0} max={5} value={c.revisions} onChange={(e) => set("revisions", Number(e.target.value))} className="w-full accent-[var(--primary-strong)]" />
            </div>
            <div>
              <p className={label}>저작권</p>
              <div className="space-y-2">
                {(Object.keys(COPYRIGHT_LABEL) as Copyright[]).map((k) => (
                  <button key={k} type="button" onClick={() => set("copyright", k)} className={`w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm ${c.copyright === k ? "border-foreground bg-accent font-bold" : "border-transparent bg-muted"}`}>
                    {COPYRIGHT_LABEL[k]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={label} htmlFor="cancel">취소·위약 조건</label>
              <textarea id="cancel" maxLength={300} rows={2} className={field} value={c.cancelTerms} onChange={(e) => set("cancelTerms", e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <ContractDocument c={{ ...c, proposerSign: sign ?? undefined } as Contract} />
            <div>
              <p className={label}>제안자 전자서명</p>
              <SignaturePad onChange={setSign} />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary-strong)]" />
              위 계약 내용을 모두 확인했으며, 전자서명으로 계약을 제안하는 것에 동의해요.
            </label>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t bg-card p-4">
        <button
          disabled={!canNext}
          onClick={() => (step < 2 ? setStep(step + 1) : submit())}
          className="h-14 w-full rounded-2xl bg-brand font-bold shadow-soft disabled:opacity-40"
        >
          {step < 2 ? "다음" : "서명하고 제안 보내기"}
        </button>
      </div>
    </PhoneFrame>
  );
}
