import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { ContractDocument } from "@/components/ContractDocument";
import { MoneyBreakdown } from "@/components/RevenueBreakdown";
import { payModeOf } from "@/lib/money";
import { PartnerAvatar, RoleBadge } from "@/components/PartnerBits";
import { SignaturePad } from "@/components/SignaturePad";
import { getPartner } from "@/lib/colabi";
import { todayISO, useStore, type Contract } from "@/lib/store";

export const Route = createFileRoute("/project/$id")({
  head: () => ({
    meta: [
      { title: "프로젝트 상세 · 계약서 — 콜라비" },
      { name: "description", content: "콜라보 프로젝트의 진행 상황과 전자계약서를 확인하세요." },
      { property: "og:title", content: "프로젝트 상세 — 콜라비" },
      { property: "og:description", content: "콜라보 프로젝트와 전자계약서 확인" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectDetail,
});

const STATUS_LABEL = { ongoing: "진행중", received: "제안받음", sent: "서명 대기", done: "완료" } as const;

function ProjectDetail() {
  const { id } = Route.useParams();
  const { projects, updateProject, removeProject, sendMessage, hydrated, profile } = useStore();
  const router = useRouter();
  const navigate = useNavigate();
  const [sign, setSign] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const pr = projects.find((p) => p.id === id);
  const partner = pr ? getPartner(pr.partnerId) : undefined;

  const back = (
    <button onClick={() => router.history.back()} aria-label="뒤로" className="rounded-full p-1.5 hover:bg-muted">
      <ChevronLeft className="h-5 w-5" />
    </button>
  );

  if (!pr || !partner) {
    return (
      <PhoneFrame>
        <SubHeader title="프로젝트" back={back} />
        <p className="py-20 text-center text-sm text-muted-foreground">{hydrated ? "프로젝트를 찾을 수 없어요." : "불러오는 중…"}</p>
      </PhoneFrame>
    );
  }

  const accept = () => {
    updateProject(pr.id, {
      status: "ongoing",
      progress: 5,
      contract: { partnerName: profile.nickname || pr.contract.partnerName, partnerSign: sign ?? undefined, partnerSignedAt: todayISO() } as Partial<Contract>,
    });
    sendMessage(partner.id, `✅ '${pr.contract.title}' 계약서에 서명했어요. 콜라보를 시작해요!`, "system");
    toast.success("계약이 체결됐어요! 진행중 탭으로 옮겼어요");
    navigate({ to: "/projects", search: { tab: "ongoing" } });
  };
  const decline = () => {
    removeProject(pr.id);
    sendMessage(partner.id, `'${pr.contract.title}' 제안을 정중히 거절했어요.`, "system");
    toast("제안을 거절했어요");
    navigate({ to: "/projects", search: { tab: "received" } });
  };

  return (
    <PhoneFrame>
      <SubHeader title={pr.contract.title} back={back} />
      <div className="flex-1 space-y-4 px-5 pb-36 pt-5">
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
          <PartnerAvatar p={partner} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-bold">{partner.name}</p>
              <RoleBadge role={partner.role} />
            </div>
            <p className="text-xs text-muted-foreground">상태 · {STATUS_LABEL[pr.status]}</p>
          </div>
          <Link to="/chat/$id" params={{ id: partner.id }} className="rounded-full bg-muted p-2.5" aria-label="채팅">
            <MessageCircle className="h-4 w-4" />
          </Link>
        </div>

        {pr.status === "ongoing" && (
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex justify-between text-sm">
              <span className="font-bold">진행률</span>
              <span className="font-bold">{pr.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={pr.progress}
              onChange={(e) => updateProject(pr.id, { progress: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--primary-strong)]"
              aria-label="진행률 조정"
            />
          </div>
        )}

        {pr.contract.amount ? (
          <div>
            <p className="mb-2 text-sm font-bold">{pr.status === "done" ? "정산 내역" : payModeOf(pr.contract.collabType) === "fee" ? "지급 금액 예상" : "수익 배분 예상"}</p>
            <MoneyBreakdown mode={payModeOf(pr.contract.collabType)} amount={pr.contract.amount} category={pr.contract.category} creatorPct={pr.contract.creatorPct} role={profile.role} done={pr.status === "done"} />
          </div>
        ) : null}

        <ContractDocument c={pr.contract} />

        {pr.status === "received" && (
          <div className="space-y-3">
            <p className="text-sm font-bold">내 전자서명</p>
            <SignaturePad onChange={setSign} />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary-strong)]" />
              계약 내용을 확인했으며 전자서명으로 계약 체결에 동의해요.
            </label>
          </div>
        )}
      </div>

      {(pr.status === "received" || pr.status === "ongoing") && (
        <div className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[430px] -translate-x-1/2 gap-2 border-t bg-card p-4">
          {pr.status === "received" ? (
            <>
              <button onClick={decline} className="h-14 flex-1 rounded-2xl border font-bold">
                거절
              </button>
              <button disabled={!sign || !agree} onClick={accept} className="h-14 flex-[2] rounded-2xl bg-brand font-bold shadow-soft disabled:opacity-40">
                서명하고 계약 체결
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                updateProject(pr.id, { status: "done", progress: 100 });
                toast.success("프로젝트를 완료했어요! 콜라비 지수가 올라가요 🌱");
                navigate({ to: "/projects", search: { tab: "done" } });
              }}
              className="h-14 w-full rounded-2xl bg-brand font-bold shadow-soft"
            >
              프로젝트 완료하기
            </button>
          )}
        </div>
      )}
    </PhoneFrame>
  );
}
