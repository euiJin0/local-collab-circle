import logoAsset from "@/assets/colabi-logo.png.asset.json";

/** 콜라비 브랜드 마크 — CDN에 올라간 이미지 한 장을 그대로 씁니다. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="콜라비"
      draggable={false}
      className={`object-contain ${className}`}
    />
  );
}

export function AppIcon({ size = "h-32 w-32" }: { size?: string }) {
  return (
    <div className={`${size} flex items-center justify-center rounded-[2rem] bg-card p-4 shadow-soft`}>
      <LogoMark className="h-full w-full" />
    </div>
  );
}
