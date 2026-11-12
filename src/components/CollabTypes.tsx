import { Check } from "lucide-react";
import { COLLAB_TYPES, getCollabType, type CollabTypeId } from "@/lib/colabi";

type PickerProps = {
  value: CollabTypeId[];
  onChange: (v: CollabTypeId[]) => void;
  /** true면 여러 개, false면 하나만 고른다 */
  multiple?: boolean;
  /** 상대방이 고른 유형에 표시할 문구와 대상 */
  highlight?: { ids: readonly CollabTypeId[]; label: string };
};

/** 협업유형 카드 선택 (4가지 유형과 세부 항목을 함께 보여준다) */
export function CollabTypePicker({ value, onChange, multiple = false, highlight }: PickerProps) {
  const toggle = (id: CollabTypeId) => {
    if (!multiple) return onChange([id]);
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };
  return (
    <div className="grid grid-cols-2 gap-2" role="group">
      {COLLAB_TYPES.map((t) => {
        const on = value.includes(t.id);
        const hl = highlight?.ids.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(t.id)}
            className={`relative flex flex-col rounded-2xl border-2 p-3 text-left transition ${on ? "border-foreground bg-accent" : "border-transparent bg-muted"}`}
          >
            <span className="flex items-center justify-between">
              <span className="text-xl">{t.emoji}</span>
              {on && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </span>
            <span className="mt-1.5 text-sm font-bold">{t.name}</span>
            <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{t.items.join(" · ")}</span>
            {hl && highlight && (
              <span className="mt-2 self-start rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold">{highlight.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 협업유형 작은 칩 목록 */
export function CollabTypeChips({ ids, size = "sm" }: { ids: readonly (CollabTypeId | undefined)[]; size?: "sm" | "xs" }) {
  const types = ids.map(getCollabType).filter((t) => t != null);
  if (types.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {types.map((t) => (
        <span
          key={t.id}
          className={`rounded-full bg-secondary font-bold text-secondary-foreground ${size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
        >
          {t.emoji} {t.name}
        </span>
      ))}
    </div>
  );
}
