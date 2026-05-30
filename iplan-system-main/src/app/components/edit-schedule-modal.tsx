import React, { useState } from "react";
import { X } from "lucide-react";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: {
    type: "regular" | "special";
    title: string;
    academyName: string;
    startTime: string;
    endTime: string;
    date?: string;
    dayOfWeek?: number;
    childId?: string;
  };
  onSave: (updatedSchedule: any) => void;
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

export function EditScheduleModal({ isOpen, onClose, schedule, onSave }: EditScheduleModalProps) {
  const [title, setTitle] = useState(schedule.title || "정규 수업");
  const [academyName, setAcademyName] = useState(schedule.academyName);
  const [startTime, setStartTime] = useState(schedule.startTime);
  const [endTime, setEndTime] = useState(schedule.endTime);
  const [childId, setChildId] = useState(schedule.childId || "child1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = toMin(startTime);
    const end = toMin(endTime);
    if (end <= start) {
      alert("종료 시간이 시작 시간보다 이르거나 같을 수 없습니다.");
      return;
    }
    if (end - start > 13 * 60) {
      alert("학원 수업 시간은 13시간을 초과할 수 없습니다.");
      return;
    }
    onSave({ ...schedule, title, academyName, startTime, endTime, childId });
    onClose();
  };

  const handleDelete = () => {
    if (confirm("정말 이 일정을 삭제하시겠습니까?")) {
      onSave(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2>일정 수정</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {schedule.type === "special" && (
            <div>
              <label htmlFor="title" className="block mb-2">행사명</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="academy" className="block mb-2">학원</label>
            <input
              id="academy"
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-time" className="block mb-2">시작 시간</label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block mb-2">종료 시간</label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              삭제
            </button>
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
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
