import { getCollabType } from "@/lib/colabi";
import { BREACH_CLAUSE, LEGAL_BASIS, LEGAL_DISCLAIMER, MANUAL_CASES, MANUAL_STEPS } from "@/lib/contractManual";
import { contractMoney, formatWon, pct, PLATFORM_FEE_LABEL } from "@/lib/money";
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

function BreachManual() {
  return (
    <section className="mt-4 rounded-xl border border-dashed p-3">
      <p className="text-[11px] font-bold tracking-widest text-secondary-strong">계약 파기 방지 매뉴얼 · 주의 사항</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        중간에 계약을 파기하는 것을 막기 위한 대응 기준이에요. {LEGAL_BASIS}(채무불이행에 따른 손해배상)를 기준으로 아래 두 경우를
        구분합니다.
      </p>
      <ul className="mt-2 space-y-2">
        {MANUAL_CASES.map((m) => (
          <li key={m.id} className="rounded-lg bg-muted p-2.5">
            <p className="text-xs font-bold">
              {m.situation}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${m.canClaim ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.canClaim ? "손해배상 청구 가능" : "소송이 어려울 수 있음"}
              </span>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{m.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] font-bold">대응 순서</p>
      <ol className="mt-1 space-y-1.5">
        {MANUAL_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-2 text-[11px] leading-relaxed">
            <span className="font-display text-primary-strong">{i + 1}</span>
            <span>
              <b>{s.title}</b> — {s.detail}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{LEGAL_DISCLAIMER}</p>
    </section>
  );
}

export function ContractDocument({ c }: { c: Contract }) {
  const m = contractMoney(c);
  const ct = getCollabType(c.collabType);
  const rows: [string, string][] = [
    ["프로젝트명", c.title || "—"],
    ["협업유형", ct ? `${ct.name} (${ct.items.join(", ")})` : "—"],
    ["작업 범위", c.scope || "—"],
    ["결과물", c.deliverables || "—"],
    ["기간", `${c.startDate} ~ ${c.endDate}`],
    ["분야", c.category],
    ...(m.mode === "split"
      ? ([
          ["예상 매출", c.amount ? formatWon(c.amount) : "협의"],
          ["수익 배분", `판매형 콜라보(상품·서비스 개발)로, 콜라보 매출을 소상공인 ${pct(m.ownerRate)} · 창작자 ${pct(m.creatorRate)} · 콜라비 수수료 ${PLATFORM_FEE_LABEL}(고정)로 배분${c.creatorPct != null ? "(직접 제안한 비율)" : "(분야 권장 비율·기본값)"}하며, 실제 매출 기준으로 프로젝트 완료 후 정산`],
        ] as [string, string][])
      : ([
          ["콜라보 금액", c.amount ? formatWon(c.amount) : "협의"],
          ["지급 방식", `판매가 없는 콜라보로 매출을 배분하지 않으며, 소상공인이 창작자에게 ${formatWon(m.ownerPays)}을 지급. 콜라비 수수료 ${PLATFORM_FEE_LABEL}(${formatWon(m.fee)}, 고정)를 뺀 ${formatWon(m.creator)}을 창작자가 받고, 프로젝트 완료 후 정산`],
        ] as [string, string][])),
    ["저작권", COPYRIGHT_LABEL[c.copyright]],
    ["취소·위약", c.cancelTerms || "—"],
    ["불이행 대응", BREACH_CLAUSE],
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
      <BreachManual />
      <div className="mt-4 flex gap-3">
        <Sign name={c.proposerName} sign={c.proposerSign} at={c.proposerSignedAt} />
        <Sign name={c.partnerName} sign={c.partnerSign} at={c.partnerSignedAt} />
      </div>
    </article>
  );
}
