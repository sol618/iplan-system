import React, { useState } from "react";
import { X, Plus } from "lucide-react";

interface AcademyScheduleData {
  academyName: string;
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

// 학원별 일정 데이터 (실제로는 서버에서 가져옴)
const academyScheduleData: Record<string, AcademyScheduleData> = {
  "멘토학원": {
    academyName: "멘토학원",
    schedules: [
      { dayOfWeek: 2, startTime: "18:00", endTime: "21:00" },
      { dayOfWeek: 5, startTime: "18:00", endTime: "21:00" },
    ]
  },
  "예종피아노학원": {
    academyName: "예종피아노학원",
    schedules: [
      { dayOfWeek: 3, startTime: "16:00", endTime: "19:00" },
      { dayOfWeek: 4, startTime: "16:00", endTime: "19:00" },
    ]
  },
  "태비태권도": {
    academyName: "태비태권도",
    schedules: [
      { dayOfWeek: 1, startTime: "17:00", endTime: "19:00" },
      { dayOfWeek: 3, startTime: "17:00", endTime: "19:00" },
    ]
  },
};

interface AddAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: { id: string; name: string }[];
  onSave: (
    schedules: { dayOfWeek: number; academyName: string; startTime: string; endTime: string; childId: string }[],
    newChild?: { id: string; name: string }
  ) => void;
}

export function AddAcademyModal({ isOpen, onClose, children, onSave }: AddAcademyModalProps) {
  const selectableChildren = children.filter(c => c.id !== "all");

  const [academyName, setAcademyName] = useState("");
  const [childId, setChildId] = useState(() => selectableChildren[0]?.id ?? "child1");
  const [newChildName, setNewChildName] = useState("");
  const [isNewChild, setIsNewChild] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!academyName.trim()) {
      alert("학원 이름을 입력해주세요.");
      return;
    }

    if (isNewChild && !newChildName.trim()) {
      alert("자녀 이름을 입력해주세요.");
      return;
    }

    // 입력한 학원 이름으로 데이터 찾기 (실제로는 서버 API 호출)
    const academyData = academyScheduleData[academyName];
    if (!academyData) {
      alert("등록되지 않은 학원입니다. 학원 측에 먼저 등록을 요청해주세요.");
      return;
    }

    const newChildId = isNewChild ? `child${Date.now()}` : childId;
    const newChild = isNewChild ? { id: newChildId, name: newChildName.trim() } : undefined;

    // 학원의 모든 일정을 선택한 자녀에게 추가
    const schedules = academyData.schedules.map(schedule => ({
      ...schedule,
      academyName: academyData.academyName,
      childId: newChildId,
    }));

    onSave(schedules, newChild);

    // Reset form
    setAcademyName("");
    setChildId(selectableChildren[0]?.id ?? "child1");
    setNewChildName("");
    setIsNewChild(false);
    onClose();
  };

  if (!isOpen) return null;

  // 입력한 학원 이름으로 데이터 미리보기
  const previewAcademyData = academyName ? academyScheduleData[academyName] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2>학원 등록</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="academy-name" className="block mb-2">
              학원 이름
            </label>
            <input
              id="academy-name"
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              placeholder="예: 멘토학원"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              등록 가능 학원: 멘토학원, 예종피아노학원, 태비태권도
            </p>
          </div>

          {previewAcademyData && (
            <div className="p-3 rounded-lg bg-accent/30 border border-border">
              <p className="text-sm font-medium mb-2">학원 일정</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {previewAcademyData.schedules.map((schedule, idx) => {
                  const days = ["일", "월", "화", "수", "목", "금", "토"];
                  return (
                    <div key={idx}>
                      • {days[schedule.dayOfWeek]}요일 {schedule.startTime}~{schedule.endTime}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="child-type" className="block mb-2">
              자녀 선택
            </label>
            <select
              id="child-type"
              value={isNewChild ? "new" : childId}
              onChange={(e) => {
                if (e.target.value === "new") {
                  setIsNewChild(true);
                } else {
                  setIsNewChild(false);
                  setChildId(e.target.value);
                }
              }}
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {selectableChildren.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
              <option value="new">새 자녀 추가</option>
            </select>
          </div>

          {isNewChild && (
            <div>
              <label htmlFor="new-child-name" className="block mb-2">
                자녀 이름
              </label>
              <input
                id="new-child-name"
                type="text"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="예: 셋째"
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
