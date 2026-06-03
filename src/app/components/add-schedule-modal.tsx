import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  isAcademy?: boolean;
  childOptions: { id: string; name: string }[];
  academyOptions: string[];
  onSave: (payload: {
    childId: string;
    academyName: string;
    title: string;
    startTime: string;
    endTime: string;
  }) => void;
}

// 특정 날짜에 1회성(단일) 일정을 추가하는 모달. 학부모·학원 공통 사용.
// UI 구성은 EditScheduleModal과 일관되게 맞춘다.
export function AddScheduleModal({
  isOpen,
  onClose,
  date,
  isAcademy = false,
  childOptions,
  academyOptions,
  onSave,
}: AddScheduleModalProps) {
  const [title, setTitle] = useState("");
  const [childId, setChildId] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [titleError, setTitleError] = useState("");
  const [timeError, setTimeError] = useState("");

  // 모달이 열릴 때마다 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setChildId(childOptions[0]?.id ?? "");
      setAcademyName(academyOptions[0] ?? "");
      setStartTime("");
      setEndTime("");
      setTitleError("");
      setTimeError("");
    }
  }, [isOpen]);

  // 학원 계정은 학원이 고정(자기 학원)이라 드롭다운 대신 고정 표시
  const isAcademyFixed = isAcademy;

  const dateString = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!childId) {
      alert(isAcademy ? "학생을 선택해주세요." : "자녀를 선택해주세요.");
      return;
    }
    if (!academyName) {
      alert("학원을 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      setTitleError("일정 제목을 입력해 주세요.");
      return;
    }
    if (!startTime || !endTime) {
      setTimeError("시작·종료 시간을 입력해 주세요.");
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
      setTimeError("일정 시간은 13시간을 초과할 수 없습니다.");
      return;
    }
    onSave({ childId, academyName, title: title.trim(), startTime, endTime });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2>일정 추가</h2>
            <p className="text-sm text-muted-foreground">{dateString}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="add-title" className="block mb-2">
              일정 제목 <span className="text-destructive">*</span>
            </label>
            <input
              id="add-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
              placeholder="예: 보충 수업"
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${titleError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
            />
            {titleError && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{titleError}</p>
            )}
          </div>

          <div className={`grid gap-4 ${isAcademyFixed ? "grid-cols-1" : "grid-cols-2"}`}>
            <div>
              <label htmlFor="add-child" className="block mb-2">
                {isAcademy ? "학생" : "자녀"}
              </label>
              <select
                id="add-child"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {childOptions.length === 0 && <option value="">선택 가능한 대상 없음</option>}
                {childOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {!isAcademyFixed && (
              <div>
                <label htmlFor="add-academy" className="block mb-2">
                  학원
                </label>
                <select
                  id="add-academy"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {academyOptions.length === 0 && <option value="">등록된 학원 없음</option>}
                  {academyOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isAcademyFixed && (
            <div>
              <label className="block mb-2">학원</label>
              <div className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-sm">
                {academyName || "-"}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-start-time" className="block mb-2">
                시작 시간
              </label>
              <input
                id="add-start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setTimeError("");
                }}
                className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${timeError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
            </div>

            <div>
              <label htmlFor="add-end-time" className="block mb-2">
                종료 시간
              </label>
              <input
                id="add-end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setTimeError("");
                }}
                className={`w-full px-4 py-2.5 bg-input-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${timeError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
              />
            </div>
          </div>
          {timeError && (
            <p className="mt-1.5 text-sm font-medium text-destructive">{timeError}</p>
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
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
