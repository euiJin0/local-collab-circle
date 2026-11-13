import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PhoneFrame, SubHeader } from "@/components/AppShell";
import { ROLE_LABEL, type Role } from "@/lib/colabi";
import { RevenueShareTable } from "@/components/RevenueBreakdown";
import { PLATFORM_FEE_LABEL } from "@/lib/money";
import { useStore, type Settings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "설정 — 콜라비" },
      { name: "description", content: "프로필, 역할, 알림, 정산 계좌 등 콜라비 계정 설정을 관리하세요." },
      { property: "og:title", content: "설정 — 콜라비" },
      { property: "og:description", content: "프로필과 알림, 정산 계좌를 관리하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const BANKS = ["국민은행", "신한은행", "우리은행", "하나은행", "카카오뱅크", "토스뱅크", "농협은행"];

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {desc && <span className="block text-[11px] text-muted-foreground">{desc}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-primary-strong" : "bg-muted"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-card transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

function SettingsPage() {
  const { profile, settings, setProfile, setSettings, reset } = useStore();
  const router = useRouter();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(profile.nickname);
  const [bank, setBank] = useState(settings.bank || BANKS[0]!);
  const [account, setAccount] = useState(settings.account);

  // 저장된 값이 늦게 불러와지면 입력칸도 맞춰요
  useEffect(() => setNickname(profile.nickname), [profile.nickname]);
  useEffect(() => {
    setBank(settings.bank || BANKS[0]!);
    setAccount(settings.account);
  }, [settings.bank, settings.account]);

  const toggle = (k: keyof Settings) => (v: boolean) => setSettings({ [k]: v } as Partial<Settings>);
  const field = "w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
  const card = "overflow-hidden rounded-2xl border bg-card shadow-card";
  const h = "mb-2 px-1 text-xs font-bold text-muted-foreground";

  return (
    <PhoneFrame>
      <SubHeader
        title="설정"
        back={
          <button onClick={() => router.history.back()} aria-label="뒤로" className="rounded-full p-1.5 hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
      />
      <div className="flex-1 space-y-6 px-5 pb-10 pt-5">
        <section>
          <h2 className={h}>프로필</h2>
          <div className={`${card} space-y-3 p-4`}>
            <div>
              <label htmlFor="nick" className="mb-1.5 block text-sm font-bold">닉네임</label>
              <div className="flex gap-2">
                <input id="nick" maxLength={20} className={field} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="콜라비 유저" />
                <button
                  onClick={() => {
                    setProfile({ nickname: nickname.trim() });
                    toast.success("닉네임을 저장했어요");
                  }}
                  className="shrink-0 rounded-xl bg-foreground px-4 text-sm font-bold text-background"
                >
                  저장
                </button>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold">역할</p>
              <div className="grid grid-cols-2 gap-2">
                {(["creator", "owner"] as Role[]).map((r) => (
                  <button key={r} onClick={() => setProfile({ role: r })} className={`rounded-xl py-2.5 text-sm font-bold ${profile.role === r ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                    {r === "creator" ? "🎨" : "🏪"} {ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold">활동 지역</span>
              <span className="text-muted-foreground">{settings.area}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className={h}>알림</h2>
          <div className={`${card} divide-y`}>
            <Toggle label="채팅 알림" desc="새 메시지가 오면 알려드려요" checked={settings.notifyChat} onChange={toggle("notifyChat")} />
            <Toggle label="제안·계약 알림" desc="콜라보 제안과 서명 요청" checked={settings.notifyProposal} onChange={toggle("notifyProposal")} />
            <Toggle label="이벤트·혜택 알림" checked={settings.notifyMarketing} onChange={toggle("notifyMarketing")} />
          </div>
        </section>

        <section>
          <h2 className={h}>정산 계좌</h2>
          <div className={`${card} space-y-2 p-4`}>
            <select aria-label="은행" className={field} value={bank} onChange={(e) => setBank(e.target.value)}>
              {BANKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <input aria-label="계좌번호" inputMode="numeric" maxLength={20} className={field} placeholder="계좌번호 (- 없이)" value={account} onChange={(e) => setAccount(e.target.value.replace(/[^0-9]/g, ""))} />
            <button
              disabled={account.length < 8}
              onClick={() => {
                setSettings({ bank, account });
                toast.success("정산 계좌를 저장했어요");
              }}
              className="h-11 w-full rounded-xl bg-brand text-sm font-bold disabled:opacity-40"
            >
              계좌 저장
            </button>
            <p className="text-[11px] text-muted-foreground">프로젝트가 완료되면 내 몫(매출 배분 또는 받은 금액)이 이 계좌로 정산돼요.</p>
          </div>
        </section>

        <section>
          <h2 className={h}>정보</h2>
          <div className={`${card} divide-y text-sm`}>
            <div className="px-4 py-3.5">
              <div className="flex justify-between">
                <span>수익 배분 기준</span>
                <span className="text-muted-foreground">콜라비 수수료 {PLATFORM_FEE_LABEL} 고정</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">매출 배분은 판매가 일어나는 상품·서비스 개발 콜라보에만 적용되고, 그 외 협업유형은 소상공인이 창작자에게 금액을 제안해요. 아래 표는 분야별 권장 비율(기본값)이에요. 확정된 비율이 아니라서, 콜라보를 제안할 때 두 분이 협의해 비율을 직접 조절할 수 있어요. 콜라비 수수료 8%만 고정이에요.</p>
              <div className="mt-2">
                <RevenueShareTable />
              </div>
            </div>
            <div className="flex justify-between px-4 py-3.5">
              <span>앱 버전</span>
              <span className="text-muted-foreground">프로토타입 0.2</span>
            </div>
          </div>
        </section>

        <button
          onClick={() => {
            reset();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border py-3 text-sm text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" /> 처음부터 다시 시작 (예시 데이터 초기화)
        </button>
      </div>
    </PhoneFrame>
  );
}
