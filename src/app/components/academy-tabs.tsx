

export interface Academy {
  id: string;
  name: string;
}

export const academies: Academy[] = [
  { id: "mentor", name: "멘토학원" },
  { id: "yejong", name: "예종피아노학원" },
  { id: "taebee", name: "태비태권도" },
  { id: "iplan-english", name: "아이플랜어학원" },
];

// 로그인한 학부모가 캘린더에 실제로 등록(활성화)한 학원 목록.
// 캘린더의 정규 스케줄/행사와 동일한 소스만 사용한다 (가입 학원은 제외).
export function getParentAcademies(userId?: string): Academy[] {
  if (!userId) return [];
  const names = new Set<string>();
  const read = (key: string): any[] => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  read("iplan-global-schedules")
    .filter(s => s.parentUserId === userId)
    .forEach(s => s.academyName && names.add(s.academyName));
  read("iplan-global-events")
    .filter(e => e.parentUserId === userId)
    .forEach(e => e.academyName && names.add(e.academyName));

  const result: Academy[] = academies.filter(a => names.has(a.name));
  // 표준 목록에 없는 학원명은 이름을 id로 사용해 추가
  names.forEach(n => {
    if (!result.some(a => a.name === n)) result.push({ id: n, name: n });
  });
  return result;
}

interface AcademyTabsProps {
  academies: Academy[];
  selectedAcademy: string;
  onSelectAcademy: (academyId: string) => void;
}

export function AcademyTabs({ academies: tabs, selectedAcademy, onSelectAcademy }: AcademyTabsProps) {
  return (
    <div className="w-full border-b bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((academy) => (
            <button
              key={academy.id}
              onClick={() => onSelectAcademy(academy.id)}
              className={`px-6 py-3 whitespace-nowrap transition-colors border-b-2 ${
                selectedAcademy === academy.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <span className="font-medium">{academy.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
