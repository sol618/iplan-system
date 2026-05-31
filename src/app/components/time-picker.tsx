import React, { useRef, useEffect } from "react";

const ITEM_H = 32;

function NumberScroller({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const count = max - min + 1;
  const isProgrammatic = useRef(false);

  // value 또는 min/max 변경 시 스크롤 위치 동기화 (AM/PM 전환 포함)
  useEffect(() => {
    if (!ref.current) return;
    isProgrammatic.current = true;
    ref.current.scrollTop = (value - min) * ITEM_H;
    requestAnimationFrame(() => { isProgrammatic.current = false; });
  }, [value, min, max]);

  const snapToNearest = () => {
    if (!ref.current || isProgrammatic.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.min(count - 1, Math.max(0, idx));
    isProgrammatic.current = true;
    ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    setTimeout(() => { isProgrammatic.current = false; }, 300);
    onChange(min + clamped);
  };

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleScroll = () => {
    if (isProgrammatic.current) return;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(snapToNearest, 120);
  };

  // 마우스 드래그
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startY = e.clientY;
    const startTop = ref.current?.scrollTop ?? 0;
    const onMove = (ev: MouseEvent) => {
      if (ref.current) ref.current.scrollTop = startTop + (startY - ev.clientY);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      snapToNearest();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  // 마우스 휠
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!ref.current) return;
    const cur = Math.round(ref.current.scrollTop / ITEM_H);
    const next = Math.min(count - 1, Math.max(0, cur + (e.deltaY > 0 ? 1 : -1)));
    isProgrammatic.current = true;
    ref.current.scrollTo({ top: next * ITEM_H, behavior: "smooth" });
    setTimeout(() => { isProgrammatic.current = false; }, 300);
    onChange(min + next);
  };

  return (
    <div className="relative overflow-hidden rounded-md" style={{ width: 44, height: ITEM_H * 3 }}>
      {/* 선택 항목 하이라이트 */}
      <div
        className="absolute inset-x-0 bg-gray-200/70 dark:bg-gray-600/30 border-y border-gray-300/60 dark:border-gray-500/40 pointer-events-none z-10"
        style={{ top: ITEM_H + 3, height: ITEM_H - 6 }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className="h-full overflow-y-scroll cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        <div style={{ height: ITEM_H }} />
        {Array.from({ length: count }, (_, i) => {
          const num = min + i;
          const selected = num === value;
          return (
            <div
              key={num}
              style={selected ? { height: ITEM_H, color: "#111827", fontWeight: "700", fontSize: "0.875rem" } : { height: ITEM_H }}
              className={`flex items-center justify-center select-none transition-all ${
                selected ? "" : "text-xs text-muted-foreground"
              }`}
            >
              {String(num).padStart(2, "0")}
            </div>
          );
        })}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [hStr, mStr] = value.split(":");
  const h = Math.min(23, Math.max(0, parseInt(hStr) || 0));
  const m = Math.min(59, Math.max(0, parseInt(mStr) || 0));
  const isPM = h >= 12;
  const pad = (n: number) => String(n).padStart(2, "0");

  const handleToggle = (toPM: boolean) => {
    if (toPM && !isPM) onChange(`${pad(h + 12)}:${pad(m)}`);
    else if (!toPM && isPM) onChange(`${pad(h - 12)}:${pad(m)}`);
  };

  return (
    <div className="flex items-center justify-center gap-1 px-2 py-1 bg-input-background border border-border rounded-lg w-full">
      {/* 오전 / 오후 토글 */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => handleToggle(false)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            !isPM
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          오전
        </button>
        <button
          type="button"
          onClick={() => handleToggle(true)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            isPM
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          오후
        </button>
      </div>

      {/* 시 스크롤: 오전 00~11 / 오후 12~23 */}
      <NumberScroller
        value={h}
        min={isPM ? 12 : 0}
        max={isPM ? 23 : 11}
        onChange={(newH) => onChange(`${pad(newH)}:${pad(m)}`)}
      />

      <span className="text-base font-bold select-none">:</span>

      {/* 분 스크롤: 00~59 */}
      <NumberScroller
        value={m}
        min={0}
        max={59}
        onChange={(newM) => onChange(`${pad(h)}:${pad(newM)}`)}
      />
    </div>
  );
}
