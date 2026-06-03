import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AcademyScheduleData {
  academyName: string;
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export const academyScheduleData: Record<string, AcademyScheduleData> = {
  "아이플랜어학원": {
    academyName: "아이플랜어학원",
    schedules: [
      { dayOfWeek: 1, startTime: "16:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "16:00", endTime: "18:00" },
    ]
  },
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

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function AddAcademyModal({ isOpen, onClose, children, onSave }: AddAcademyModalProps) {
  const selectableChildren = children.filter(c => c.id !== "all");

  const [academyName, setAcademyName] = useState("");
  const [academyError, setAcademyError] = useState("");
  const [childId, setChildId] = useState(selectableChildren[0]?.id ?? "");
  const [newChildName, setNewChildName] = useState("");
  const [childNameError, setChildNameError] = useState("");
  // 자녀가 없으면 처음부터 새 자녀 추가 모드로 시작
  const [isNewChild, setIsNewChild] = useState(selectableChildren.length === 0);

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      const fresh = children.filter(c => c.id !== "all");
      setAcademyName("");
      setAcademyError("");
      setChildId(fresh[0]?.id ?? "");
      setNewChildName("");
      setChildNameError("");
      setIsNewChild(fresh.length === 0);
    }
  }, [isOpen]);

  const trimmedName = academyName.trim();
  const previewData = trimmedName ? academyScheduleData[trimmedName] : null;

  const handleClose = () => {
    setAcademyName("");
    setAcademyError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trimmedName) {
      setAcademyError("학원 이름을 입력해 주세요.");
      return;
    }

    if (!previewData) {
      setAcademyError("등록되지 않은 학원입니다. 학원 측에 먼저 등록을 요청해주세요.");
      return;
    }

    if (isNewChild && !newChildName.trim()) {
      setChildNameError("자녀 이름을 입력해 주세요.");
      return;
    }

    const newChildId = isNewChild ? `child${Date.now()}` : childId;
    const newChild = isNewChild ? { id: newChildId, name: newChildName.trim() } : undefined;

    const schedules = previewData.schedules.map(s => ({
      ...s,
      academyName: trimmedName,
      childId: newChildId,
    }));

    onSave(schedules, newChild);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2>학원 등록</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="academy-name" className="block mb-2">
              학원 이름 <span className="text-destructive">*</span>
            </label>
            <input
              id="academy-name"
              type="text"
              value={academyName}
              onChange={(e) => { setAcademyName(e.target.value); setAcademyError(""); }}
              placeholder="예: 멘토학원"
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${academyError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {academyError && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{academyError}</p>
            )}
          </div>

          {previewData && (
            <div className="p-3 rounded-lg bg-accent/30 border border-border">
              <p className="text-sm font-medium mb-2">학원 일정</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {previewData.schedules.map((s, idx) => (
                  <div key={idx}>
                    • {DAYS[s.dayOfWeek]}요일 {s.startTime}~{s.endTime}
                  </div>
                ))}
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
                자녀 이름 <span className="text-destructive">*</span>
              </label>
              <input
                id="new-child-name"
                type="text"
                value={newChildName}
                onChange={(e) => { setNewChildName(e.target.value); setChildNameError(""); }}
                placeholder="예: 셋째"
                className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${childNameError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {childNameError && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{childNameError}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
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
