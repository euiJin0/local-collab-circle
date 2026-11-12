import { getCollabType } from "@/lib/colabi";
import { formatWon, pct, PLATFORM_FEE_LABEL, shareOf } from "@/lib/money";
import type { Contract } from "@/lib/store";

export const COPYRIGHT_LABEL = {
  owner: "소상공인(의뢰자)에게 귀속",
  creator: "창작자에게 귀속, 사용권 허락",
  shared: "공동 소유",
} as const;

function Sign({ name, sign, at }: { name: string; sign: string | undefined; at: string | undefined }) {
  return (
    <div className="flex-1 rounded-xl border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">서명</p>
      <p className="text-sm font-bold">{name || "—"}</p>
      <div className="mt-1 flex h-14 items-center justify-center rounded-lg bg-muted">
        {sign && sign.startsWith("data:") ? (
          <img src={sign} alt={`${name} 서명`} className="h-full object-contain" />
        ) : sign ? (
          <span className="font-display text-lg text-secondary-strong">{name}</span>
        ) : (
          <span className="text-xs text-muted-foreground">서명 대기</span>
        )}
      </div>
      {at && <p className="mt-1 text-[11px] text-muted-foreground">{at} 서명 완료</p>}
    </div>
  );
}

export function ContractDocument({ c }: { c: Contract }) {
  const sh = shareOf(c.category, c.creatorPct);
  const ct = getCollabType(c.collabType);
  const rows: [string, string][] = [
    ["프로젝트명", c.title || "—"],
    ["협업유형", ct ? `${ct.name} (${ct.items.join(", ")})` : "—"],
    ["작업 범위", c.scope || "—"],
    ["결과물", c.deliverables || "—"],
    ["기간", `${c.startDate} ~ ${c.endDate}`],
    ["분야", c.category],
    ["예상 매출", c.revenue ? formatWon(c.revenue) : "협의"],
    ["수익 배분", `콜라보 매출을 소상공인 ${pct(sh.owner)} · 창작자 ${pct(sh.creator)} · 콜라비 수수료 ${PLATFORM_FEE_LABEL}(고정)로 배분${c.creatorPct != null ? "(직접 제안한 비율)" : "(분야 권장 비율·기본값)"}하며, 실제 매출 기준으로 프로젝트 완료 후 정산`],
    ["저작권", COPYRIGHT_LABEL[c.copyright]],
    ["취소·위약", c.cancelTerms || "—"],
  ];
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-4 border-b pb-3 text-center">
        <p className="text-[11px] font-bold tracking-widest text-primary-strong">COLABI E-CONTRACT</p>
        <h3 className="font-display text-xl">콜라보 협업 계약서</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {c.proposerName || "제안자"}(갑)와 {c.partnerName || "파트너"}(을)는 아래와 같이 협업 계약을 체결합니다.
        </p>
      </div>
      <dl className="space-y-2.5 text-sm">
        {rows.map(([k, v], i) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-2">
            <dt className="text-muted-foreground">
              제{i + 1}조 {k}
            </dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 rounded-lg bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
        양 당사자는 본 계약의 내용을 성실히 이행하며, 분쟁 발생 시 콜라비 중재 가이드에 따라 우선 협의합니다. 본 계약서는 전자서명으로 체결되며 서면 계약과 동일한 효력을 갖는 것을 목표로 합니다.
      </p>
      <div className="mt-4 flex gap-3">
        <Sign name={c.proposerName} sign={c.proposerSign} at={c.proposerSignedAt} />
        <Sign name={c.partnerName} sign={c.partnerSign} at={c.partnerSignedAt} />
      </div>
    </article>
  );
}
