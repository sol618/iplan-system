import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from "lucide-react";
import { DayScheduleModal } from "./day-schedule-modal";
import { EditScheduleModal } from "./edit-schedule-modal";
import { AddAcademyModal, academyScheduleData } from "./add-academy-modal";
import { AddEventModal } from "./add-event-modal";

interface Child {
  id: string;
  name: string;
}

interface RegularSchedule {
  id: string;
  parentUserId: string;
  parentName: string;
  childId: string;
  childName: string;
  academyName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  excludedDates?: string[]; // 이 반복 일정에서 1회 삭제된 날짜들("YYYY-MM-DD")
}

interface SpecialEvent {
  id: string;
  parentUserId: string;
  parentName: string;
  childId: string;
  childName: string;
  academyName: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

const GLOBAL_SCHEDULES_KEY = "iplan-global-schedules";
const GLOBAL_EVENTS_KEY = "iplan-global-events";
// 정규 스케줄을 이미 자동 시딩한 학부모 userId 목록 (학부모당 1회만 시딩 → 삭제한 스케줄이 되살아나지 않음)
const SEEDED_USERS_KEY = "iplan-seeded-users";

const DEFAULT_USERS = [
  { userId: "parent123", name: "홍길동", childName: "홍지우", academy: "태비태권도" },
  { userId: "chulsoo456", name: "김철수", childName: "김민재", academy: "아이플랜어학원" },
];

function getRegistrationData(userId: string): { name: string; childName: string; academy: string } | null {
  try {
    const raw = localStorage.getItem("iplan-users");
    const all: { userId: string; name: string; childName: string; academy: string }[] = raw
      ? JSON.parse(raw)
      : DEFAULT_USERS;
    return all.find(u => u.userId === userId) ?? null;
  } catch {
    return null;
  }
}

// 등록 학부모 전체 목록 (회원가입 DB). 시딩의 소스로 사용한다.
function getAllRegisteredUsers(): { userId: string; name: string; childName: string; academy: string }[] {
  try {
    const raw = localStorage.getItem("iplan-users");
    return raw ? JSON.parse(raw) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

// 등록된 모든 학부모의 학원 일정을 전역 저장소에 '학부모당 1회'만 시딩한다.
// - 각 학부모의 캘린더 방문 여부와 무관하게, 학원 계정에서 자기 학원의 모든 학생이 보이도록 한다.
// - 이미 시딩한 학부모(SEEDED_USERS_KEY)는 재시딩하지 않으므로 삭제한 정규 스케줄이 되살아나지 않는다.
// - 전역 저장소에 직접 기록하므로 여러 번 호출(예: StrictMode)해도 결과가 동일하다(멱등).
export function ensureSeeded(): RegularSchedule[] {
  let global: RegularSchedule[] = [];
  try { global = JSON.parse(localStorage.getItem(GLOBAL_SCHEDULES_KEY) ?? "[]"); } catch { global = []; }

  let seededUsers: string[] = [];
  try { seededUsers = JSON.parse(localStorage.getItem(SEEDED_USERS_KEY) ?? "[]"); } catch { seededUsers = []; }

  const additions: RegularSchedule[] = [];
  const newlySeeded: string[] = [];
  getAllRegisteredUsers().forEach(u => {
    if (seededUsers.includes(u.userId)) return;
    newlySeeded.push(u.userId);
    // 이미 전역에 일정이 있거나 시딩 정보가 부족하면 추가 일정은 만들지 않되, 시딩 완료로는 표시한다.
    if (global.some(s => s.parentUserId === u.userId) || !u.childName || !u.academy) return;
    const academyData = academyScheduleData[u.academy];
    if (!academyData) return;
    academyData.schedules.forEach((s: { dayOfWeek: number; startTime: string; endTime: string }) => {
      additions.push({
        ...s,
        id: makeId(),
        parentUserId: u.userId,
        parentName: u.name,
        childId: "child1",
        childName: u.childName,
        academyName: u.academy,
      });
    });
  });

  if (newlySeeded.length === 0) return global;

  const updated = [...global, ...additions];
  localStorage.setItem(GLOBAL_SCHEDULES_KEY, JSON.stringify(updated));
  localStorage.setItem(SEEDED_USERS_KEY, JSON.stringify([...seededUsers, ...newlySeeded]));
  return updated;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Date → "YYYY-MM-DD"
function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// 저장된 일정에 고유 id가 없거나 중복되면 새로 부여한다.
// (id가 없으면 삭제·수정이 여러 일정에 한꺼번에 적용되는 문제를 방지)
function ensureIds<T extends { id?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.map(item => {
    let id = item.id;
    if (!id || seen.has(id)) id = makeId();
    seen.add(id);
    return { ...item, id };
  });
}

// 동일한 학생의 동일한 수업이 서로 다른 childId/id로 중복 저장된 경우 하나로 합친다.
// (예: 시딩으로 생긴 정규 스케줄과 학부모가 '새 자녀 추가'로 같은 자녀를 다시 등록해 생긴 스케줄)
// → 학원 캘린더에서 같은 학생이 두 번 보이는 문제를 방지한다. 제외 날짜(excludedDates)는 병합한다.
function dedupeSchedules(schedules: RegularSchedule[]): RegularSchedule[] {
  const byKey = new Map<string, RegularSchedule>();
  for (const s of schedules) {
    const key = `${s.parentUserId}|${s.parentName}|${s.childName}|${s.academyName}|${s.dayOfWeek}|${s.startTime}|${s.endTime}`;
    const existing = byKey.get(key);
    if (existing) {
      const mergedExcluded = [...new Set([...(existing.excludedDates ?? []), ...(s.excludedDates ?? [])])];
      existing.excludedDates = mergedExcluded;
    } else {
      byKey.set(key, { ...s });
    }
  }
  return [...byKey.values()];
}

const COLOR_PALETTE = [
  { bg: "bg-sky-100/80 dark:bg-sky-900/20",     text: "text-sky-700 dark:text-sky-300",     border: "border-sky-200 dark:border-sky-800" },
  { bg: "bg-pink-500/10",                        text: "text-pink-700 dark:text-pink-300",   border: "border-pink-200 dark:border-pink-800" },
  { bg: "bg-emerald-100/80 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "bg-amber-100/80 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300",  border: "border-amber-200 dark:border-amber-800" },
  { bg: "bg-violet-100/80 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
];

function hashColor(key: string) {
  const h = Math.abs(key.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0));
  // 행사·정규 스케줄 모두 동일한 배경색을 사용한다.
  return COLOR_PALETTE[h % COLOR_PALETTE.length]!;
}

export function CalendarPage({
  userId,
  userType = "parent",
  displayName = "",
}: {
  userId?: string | undefined;
  userType?: "parent" | "academy";
  displayName?: string;
}) {
  const isAcademy = userType === "academy";
  const myAcademyName = isAcademy ? displayName : undefined;
  const parentDisplayName = !isAcademy ? displayName : "";

  const childrenKey = `iplan-${userId ?? "default"}-children`;

  // ── 전역 스케줄 (학부모·학원 공유) ──────────────────────────────
  // 등록된 모든 학부모의 학원 일정을 1회씩 시딩하여, 학원 계정에서 모든 학생이 보이도록 한다.
  const [allSchedules, setAllSchedules] = useState<RegularSchedule[]>(() => ensureIds(dedupeSchedules(ensureSeeded())));

  const [allEvents, setAllEvents] = useState<SpecialEvent[]>(() => {
    const saved = localStorage.getItem(GLOBAL_EVENTS_KEY);
    return ensureIds(saved ? JSON.parse(saved) : []);
  });

  // ── 학부모 전용 자녀 목록 ────────────────────────────────────────
  const [children, setChildren] = useState<Child[]>(() => {
    if (isAcademy) return [];
    const saved = localStorage.getItem(childrenKey);
    if (saved) return JSON.parse(saved);

    const initialChildren: Child[] = [{ id: "all", name: "전체" }];
    if (userId) {
      const reg = getRegistrationData(userId);
      if (reg?.childName) {
        initialChildren.push({ id: "child1", name: reg.childName });
      }
    }
    return initialChildren;
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // ── localStorage 동기화 ─────────────────────────────────────────
  // 전역 스케줄은 모든 학부모가 공유하므로, '통째로 덮어쓰기'를 하면 다른 학부모가 추가한
  // 일정이 사라질 수 있다(lost write). 따라서 저장소의 최신값에서 '내(현재 학부모) 일정'만
  // 교체하고 나머지는 그대로 보존한다.
  // 학원 계정도 정규 스케줄을 변경(삭제·수정)할 수 있으므로 반드시 저장해야 한다. 저장하지 않으면
  // 학원에서 삭제한 일정이 전역 저장소에 반영되지 않아 부모 계정에서 그대로 보이는 문제가 생긴다.
  // 학원 계정은 전역 스케줄 전체를 메모리에 들고 있으므로(allSchedules) 통째로 기록한다.
  useEffect(() => {
    if (isAcademy) {
      localStorage.setItem(GLOBAL_SCHEDULES_KEY, JSON.stringify(allSchedules));
      return;
    }
    let stored: RegularSchedule[] = [];
    try { stored = JSON.parse(localStorage.getItem(GLOBAL_SCHEDULES_KEY) ?? "[]"); } catch { stored = []; }
    const others = stored.filter(s => s.parentUserId !== userId);
    const mine = allSchedules.filter(s => s.parentUserId === userId);
    localStorage.setItem(GLOBAL_SCHEDULES_KEY, JSON.stringify([...others, ...mine]));
  }, [allSchedules, isAcademy, userId]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_EVENTS_KEY, JSON.stringify(allEvents));
  }, [allEvents]);

  useEffect(() => {
    if (!isAcademy) {
      localStorage.setItem(childrenKey, JSON.stringify(children));
    }
  }, [children, childrenKey, isAcademy]);

  // ── 내 스케줄/행사 필터링 ──────────────────────────────────────
  const mySchedules = isAcademy
    ? allSchedules.filter(s => s.academyName === myAcademyName)
    : allSchedules.filter(s => s.parentUserId === userId);

  const myEvents = isAcademy
    ? allEvents.filter(e => e.academyName === myAcademyName)
    : allEvents.filter(e => e.parentUserId === userId);

  // ── 학원 모드: 탭에 표시할 학생 목록 (학부모(자녀) 형태) ─────────
  const academyStudentTabs: Child[] = (() => {
    if (!isAcademy) return [];
    const seen = new Set<string>();
    const tabs: Child[] = [{ id: "all", name: "전체" }];
    mySchedules.forEach(s => {
      const key = `${s.parentUserId}|${s.childId}`;
      if (!seen.has(key)) {
        seen.add(key);
        tabs.push({ id: key, name: `${s.parentName}(${s.childName})` });
      }
    });
    return tabs;
  })();

  const displayChildren = isAcademy ? academyStudentTabs : children;

  // ── 선택한 탭으로 2차 필터링 ───────────────────────────────────
  const filteredRegularSchedules = mySchedules.filter(s => {
    if (selectedChild === "all") return true;
    return isAcademy
      ? `${s.parentUserId}|${s.childId}` === selectedChild
      : s.childId === selectedChild;
  });

  const filteredSpecialEvents = myEvents.filter(e => {
    if (selectedChild === "all") return true;
    return isAcademy
      ? `${e.parentUserId}|${e.childId}` === selectedChild
      : e.childId === selectedChild;
  });

  // ── 색상 ────────────────────────────────────────────────────────
  // 행사(isSpecialEvent)와 정규 스케줄의 배경색이 일치하도록 동일한 색을 반환한다.
  const getAcademyColor = (academyName: string, _isSpecialEvent = false, childId?: string) => {
    if (isAcademy) {
      return hashColor(childId ?? academyName);
    }
    if (childId === "child2") {
      return { bg: "bg-emerald-100/80 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" };
    }
    if (academyName.includes("아이플랜어")) {
      return { bg: "bg-amber-100/80 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" };
    }
    if (academyName.includes("멘토")) {
      return { bg: "bg-sky-100/80 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" };
    }
    if (academyName.includes("예종")) {
      return { bg: "bg-pink-500/10", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" };
    }
    return { bg: "bg-gray-500/10", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-800" };
  };

  // ── 이벤트 핸들러 ────────────────────────────────────────────────
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleEditSchedule = (schedule: any) => {
    setScheduleToEdit(schedule);
    setIsDayModalOpen(false);
    setIsEditModalOpen(true);
  };

  // 정규 스케줄 전체 삭제 (반복 일정 자체를 제거 → 학원 추가로 다시 등록 가능)
  const handleDeleteRegularSchedule = (scheduleId: string) => {
    const target = allSchedules.find(s => s.id === scheduleId);
    const who = target ? (isAcademy ? `${target.parentName}(${target.childName}) ` : "") : "";
    const label = target
      ? `${who}${getDayOfWeekName(target.dayOfWeek)} ${target.startTime}~${target.endTime} ${target.academyName}`
      : "";
    if (!window.confirm(`정규 스케줄을 삭제하시겠습니까?${label ? `\n(${label})` : ""}`)) return;
    setAllSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  const handleAddAcademy = (
    newSchedules: { dayOfWeek: number; academyName: string; startTime: string; endTime: string; childId: string }[],
    newChild?: { id: string; name: string }
  ) => {
    const childIdToUse = newSchedules[0]?.childId ?? "";
    const childNameToUse = newChild
      ? newChild.name
      : children.find(c => c.id === childIdToUse)?.name ?? "";

    const dedupedSchedules = newSchedules.filter(newS =>
      !allSchedules.some(ex =>
        ex.parentUserId === userId &&
        ex.childId === newS.childId &&
        ex.academyName === newS.academyName &&
        ex.dayOfWeek === newS.dayOfWeek &&
        ex.startTime === newS.startTime &&
        ex.endTime === newS.endTime
      )
    );

    if (dedupedSchedules.length === 0 && !newChild) {
      alert("이미 등록된 학원 일정입니다.");
      return;
    }
    if (dedupedSchedules.length > 0 && dedupedSchedules.length < newSchedules.length) {
      alert("일부 일정이 이미 등록되어 있어 중복 일정은 제외하고 등록합니다.");
    }

    if (dedupedSchedules.length > 0) {
      const fullSchedules: RegularSchedule[] = dedupedSchedules.map(s => ({
        ...s,
        id: makeId(),
        parentUserId: userId ?? "",
        parentName: parentDisplayName,
        childName: childNameToUse,
      }));
      setAllSchedules(prev => [...prev, ...fullSchedules]);
    }
    if (newChild) {
      setChildren(prev => [...prev, newChild]);
    }
  };

  const handleAddEvent = ({
    studentId,
    date,
    startTime,
    endTime,
    title,
    description,
  }: {
    studentId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
  }) => {
    const [parentUserId = "", childId = ""] = studentId.split("|");
    const related = allSchedules.find(
      s => s.parentUserId === parentUserId && s.childId === childId
    );
    const newEvent: SpecialEvent = {
      id: makeId(),
      parentUserId,
      parentName: related?.parentName ?? "",
      childId,
      childName: related?.childName ?? "",
      academyName: myAcademyName ?? "",
      date,
      title,
      startTime,
      endTime,
      description,
    };
    setAllEvents(prev => [...prev, newEvent]);
  };

  const handleSaveSchedule = (updatedSchedule: any) => {
    if (updatedSchedule === null) {
      if (scheduleToEdit.type === "regular") {
        // 정규 스케줄은 반복 일정이므로, 선택한 날짜 1회만 제외(나머지 주는 유지)
        const dateString = selectedDate ? toDateString(selectedDate) : null;
        if (dateString) {
          setAllSchedules(prev =>
            prev.map(s =>
              s.id === scheduleToEdit.id
                ? { ...s, excludedDates: [...(s.excludedDates ?? []), dateString] }
                : s
            )
          );
        }
      } else {
        setAllEvents(prev => prev.filter(e => e.id !== scheduleToEdit.id));
      }
    } else {
      if (updatedSchedule.type === "regular") {
        setAllSchedules(prev =>
          prev.map(s => s.id === scheduleToEdit.id ? { ...s, ...updatedSchedule } : s)
        );
      } else {
        setAllEvents(prev =>
          prev.map(e => e.id === scheduleToEdit.id ? { ...e, ...updatedSchedule } : e)
        );
      }
    }
  };

  const getSchedulesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dateString = toDateString(date);
    return {
      regularSchedule: filteredRegularSchedules.filter(
        s => s.dayOfWeek === dayOfWeek && !(s.excludedDates ?? []).includes(dateString)
      ),
      specialEvent: filteredSpecialEvents.filter(e => e.date === dateString),
    };
  };

  const getDayOfWeekName = (d: number) => ["일", "월", "화", "수", "목", "금", "토"][d];

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const currentMonth = currentDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            <h1>학원 일정</h1>
          </div>
          {!isAcademy && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>학원 추가</span>
            </button>
          )}
          {isAcademy && (
            <button
              onClick={() => setIsAddEventModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>행사 추가</span>
            </button>
          )}
        </div>
        <p className="text-muted-foreground">
          {isAcademy ? "등록된 학생의 수업 일정을 확인하세요" : "자녀의 학원 스케줄과 행사를 확인하세요"}
        </p>
      </div>

      {/* 자녀 / 학생 탭 */}
      <div className="mb-6 border-b">
        <div className="flex gap-1 overflow-x-auto">
          {displayChildren.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`px-6 py-3 whitespace-nowrap transition-colors border-b-2 ${
                selectedChild === child.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {/* 정규 스케줄 & 다가오는 행사 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="mb-3">정규 스케줄</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredRegularSchedules.length > 0 ? (
              [...filteredRegularSchedules]
                .sort((a, b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek))
                .map((schedule, index) => {
                  const colors = getAcademyColor(schedule.academyName, false, schedule.childId);
                  const label = isAcademy
                    ? `${schedule.parentName}(${schedule.childName})`
                    : children.find(c => c.id === schedule.childId)?.name;
                  return (
                    <div key={schedule.id ?? index} className={`flex items-center gap-2 text-sm p-2 rounded ${colors.bg}`}>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{getDayOfWeekName(schedule.dayOfWeek)}</span>
                      <span className="text-muted-foreground">{schedule.startTime}~{schedule.endTime}</span>
                      {!isAcademy && <span className={colors.text}>{schedule.academyName}</span>}
                      {selectedChild === "all" && label && label !== "전체" && (
                        <span className="text-xs text-muted-foreground">({label})</span>
                      )}
                      <button
                        onClick={() => handleDeleteRegularSchedule(schedule.id)}
                        className="ml-auto p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="정규 스케줄 삭제"
                        title="정규 스케줄 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">등록된 정규 스케줄이 없습니다</p>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <h3 className="mb-3">다가오는 행사</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredSpecialEvents.length > 0 ? (
              [...filteredSpecialEvents]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event, index) => {
                  const colors = getAcademyColor(event.academyName, true, event.childId);
                  const [y = "0", m = "1", d = "1"] = event.date.split("-");
                  const eventDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                  const label = isAcademy
                    ? `${event.parentName}(${event.childName})`
                    : children.find(c => c.id === event.childId)?.name;
                  return (
                    <div key={index} className={`text-sm p-2 rounded ${colors.bg}`}>
                      <div className="flex items-center gap-2">
                        <div className="font-bold">{event.title}</div>
                        {selectedChild === "all" && label && label !== "전체" && (
                          <span className="text-xs text-muted-foreground">({label})</span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        {eventDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} {event.startTime}~{event.endTime}
                      </div>
                      {!isAcademy && <div className={`text-sm ${colors.text}`}>{event.academyName}</div>}
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">다가오는 행사가 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 월별 캘린더 */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2>{currentMonth}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-accent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-accent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 text-sm font-medium ${
                index === 0 ? "text-red-600 dark:text-red-400" :
                index === 6 ? "text-blue-600 dark:text-blue-400" :
                "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }, (_, i) => {
            const dayNumber = i - startingDayOfWeek + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
            const isToday = isCurrentMonth &&
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            const { regularSchedule, specialEvent } = isCurrentMonth
              ? getSchedulesForDate(date)
              : { regularSchedule: [], specialEvent: [] };

            return (
              <div
                key={i}
                onClick={() => isCurrentMonth && handleDateClick(date)}
                className={`min-h-24 p-2 rounded-lg border ${
                  isCurrentMonth
                    ? "bg-background hover:bg-accent/50 cursor-pointer"
                    : "bg-muted/30 text-muted-foreground"
                } ${isToday ? "border-primary border-2" : "border-border"}`}
              >
                {isCurrentMonth && (
                  <div className="h-full flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${
                      date.getDay() === 0 ? "text-red-600 dark:text-red-400" :
                      date.getDay() === 6 ? "text-blue-600 dark:text-blue-400" : ""
                    }`}>{dayNumber}</span>
                    <div className="space-y-1 text-xs">
                      {regularSchedule.map((schedule, idx) => {
                        const colors = getAcademyColor(schedule.academyName, false, schedule.childId);
                        const label = isAcademy
                          ? schedule.childName
                          : schedule.academyName.replace("학원", "");
                        return (
                          <div key={idx} className={`${colors.bg} ${colors.text} rounded px-1 py-0.5 truncate`}>
                            {schedule.startTime.slice(0, 5)} {label}
                          </div>
                        );
                      })}
                      {specialEvent.map((event, idx) => {
                        const colors = getAcademyColor(event.academyName, true, event.childId);
                        return (
                          <div key={idx} className={`${colors.bg} ${colors.text} rounded px-1 py-0.5 truncate font-medium`}>
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!isAcademy && (
        <AddAcademyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          children={children}
          onSave={handleAddAcademy}
        />
      )}
      {isAcademy && (
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          students={academyStudentTabs.filter(s => s.id !== "all")}
          onSave={handleAddEvent}
        />
      )}

      {selectedDate && (
        <>
          <DayScheduleModal
            isOpen={isDayModalOpen}
            onClose={() => setIsDayModalOpen(false)}
            date={selectedDate}
            regularSchedules={getSchedulesForDate(selectedDate).regularSchedule}
            specialEvents={getSchedulesForDate(selectedDate).specialEvent}
            onEditSchedule={handleEditSchedule}
            getAcademyColor={getAcademyColor}
          />
          {scheduleToEdit && (
            <EditScheduleModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setScheduleToEdit(null);
              }}
              schedule={scheduleToEdit}
              onSave={handleSaveSchedule}
              isAcademy={isAcademy}
              childOptions={
                isAcademy
                  ? mySchedules
                      .filter((s, i, arr) =>
                        arr.findIndex(x => x.parentUserId === s.parentUserId && x.childId === s.childId) === i
                      )
                      .map(s => ({ id: s.childId, name: s.childName }))
                  : children.filter(c => c.id !== "all")
              }
              academyOptions={[...new Set(mySchedules.map(s => s.academyName))]}
            />
          )}
        </>
      )}
    </div>
  );
}
