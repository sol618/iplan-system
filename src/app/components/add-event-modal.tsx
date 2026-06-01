import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Student {
  id: string;   // "parentUserId|childId"
  name: string; // "학부모(자녀)"
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSave: (event: {
    studentId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
  }) => void;
}

export function AddEventModal({ isOpen, onClose, students, onSave }: AddEventModalProps) {
  const todayStr = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  };

  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStudentId(students[0]?.id ?? "");
      setDate(todayStr());
      setStartTime("10:00");
      setEndTime("11:00");
      setTitle("");
      setTitleError("");
      setTimeError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      alert("학생을 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      setTitleError("행사 제목을 입력해 주세요.");
      return;
    }
    if (!date) {
      alert("날짜를 선택해주세요.");
      return;
    }

    const [sh = 0, sm = 0] = startTime.split(":").map(Number);
    const [eh = 0, em = 0] = endTime.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (end <= start) {
      setTimeError("종료 시간이 시작 시간보다 이르거나 같을 수 없습니다.");
      return;
    }
    if (end - start > 13 * 60) {
      setTimeError("행사 시간은 13시간을 초과할 수 없습니다.");
      return;
    }

    onSave({
      studentId,
      date,
      startTime,
      endTime,
      title: title.trim(),
      description: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-card z-10">
          <h2>행사 추가</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {students.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>등록된 학생이 없습니다.</p>
            <p className="text-sm mt-1">학부모가 이 학원을 캘린더에 등록해야 행사를 추가할 수 있습니다.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* 학생 선택 */}
            <div>
              <label className="block mb-2">학생 선택</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* 날짜 */}
            <div>
              <label className="block mb-2">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">시작 시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setTimeError(""); }}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">종료 시간</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setTimeError(""); }}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
            {timeError && (
              <p className="text-sm text-destructive">{timeError}</p>
            )}

            {/* 행사 제목 */}
            <div>
              <label className="block mb-2">행사 제목 <span className="text-destructive">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
                placeholder="예: 레벨테스트, 발표회"
                className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${titleError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
              {titleError && (
                <p className="mt-1.5 text-sm font-medium text-destructive">{titleError}</p>
              )}
            </div>

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
                추가
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
