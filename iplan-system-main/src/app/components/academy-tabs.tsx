

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

interface AcademyTabsProps {
  selectedAcademy: string;
  onSelectAcademy: (academyId: string) => void;
}

export function AcademyTabs({ selectedAcademy, onSelectAcademy }: AcademyTabsProps) {
  return (
    <div className="w-full border-b bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto">
          {academies.map((academy) => (
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
