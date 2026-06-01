import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
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

const DEFAULT_USERS = [
  { userId: "parent123", name: "홍길동", childName: "홍지우", academy: "태비태권도" },
  { userId: "chulsoo456", name: "김철수", childName: "김민재", academy: "아이플랜어학원" },
  { userId: "younghee789", name: "이영희", childName: "이서연", academy: "아이플랜수학학원" },
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

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const COLOR_PALETTE = [
  { bg: "bg-sky-100/80 dark:bg-sky-900/20",     text: "text-sky-700 dark:text-sky-300",     border: "border-sky-200 dark:border-sky-800" },
  { bg: "bg-pink-500/10",                        text: "text-pink-700 dark:text-pink-300",   border: "border-pink-200 dark:border-pink-800" },
  { bg: "bg-emerald-100/80 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "bg-amber-100/80 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300",  border: "border-amber-200 dark:border-amber-800" },
  { bg: "bg-violet-100/80 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
];

function hashColor(key: string, isSpecial = false) {
  const h = Math.abs(key.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0));
  const c = COLOR_PALETTE[h % COLOR_PALETTE.length]!;
  return isSpecial
    ? { bg: c.bg.replace("/80", "/25"), text: c.text, border: c.border }
    : c;
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
  const [allSchedules, setAllSchedules] = useState<RegularSchedule[]>(() => {
    const saved = localStorage.getItem(GLOBAL_SCHEDULES_KEY);
    const global: RegularSchedule[] = saved ? JSON.parse(saved) : [];

    // 학부모 첫 로그인: 등록 학원 일정 자동 시딩
    if (!isAcademy && userId) {
      const hasMySchedules = global.some(s => s.parentUserId === userId);
      if (!hasMySchedules) {
        const reg = getRegistrationData(userId);
        if (reg?.childName && reg?.academy) {
          const academyData = academyScheduleData[reg.academy];
          if (academyData) {
            const seeded: RegularSchedule[] = academyData.schedules.map((s: { dayOfWeek: number; startTime: string; endTime: string }) => ({
              ...s,
              id: makeId(),
              parentUserId: userId,
              parentName: reg.name,
              childId: "child1",
              childName: reg.childName,
              academyName: reg.academy,
            }));
            return [...global, ...seeded];
          }
        }
      }
    }
    return global;
  });

  const [allEvents, setAllEvents] = useState<SpecialEvent[]>(() => {
    const saved = localStorage.getItem(GLOBAL_EVENTS_KEY);
    return saved ? JSON.parse(saved) : [];
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
  useEffect(() => {
    localStorage.setItem(GLOBAL_SCHEDULES_KEY, JSON.stringify(allSchedules));
  }, [allSchedules]);

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
  const getAcademyColor = (academyName: string, isSpecialEvent = false, childId?: string) => {
    if (isAcademy) {
      return hashColor(childId ?? academyName, isSpecialEvent);
    }
    if (childId === "child2") {
      return isSpecialEvent
        ? { bg: "bg-emerald-400/25", text: "text-emerald-800 dark:text-emerald-200", border: "border-emerald-400 dark:border-emerald-600" }
        : { bg: "bg-emerald-100/80 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" };
    }
    if (academyName.includes("멘토")) {
      return isSpecialEvent
        ? { bg: "bg-sky-400/25", text: "text-sky-800 dark:text-sky-200", border: "border-sky-400 dark:border-sky-600" }
        : { bg: "bg-sky-100/80 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" };
    }
    if (academyName.includes("예종")) {
      return isSpecialEvent
        ? { bg: "bg-pink-400/25", text: "text-pink-800 dark:text-pink-200", border: "border-pink-400 dark:border-pink-600" }
        : { bg: "bg-pink-500/10", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" };
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
        setAllSchedules(prev => prev.filter(s => s.id !== scheduleToEdit.id));
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
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      regularSchedule: filteredRegularSchedules.filter(s => s.dayOfWeek === dayOfWeek),
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
          <div className="space-y-2">
            {filteredRegularSchedules.length > 0 ? (
              [...filteredRegularSchedules]
                .sort((a, b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek))
                .map((schedule, index) => {
                  const colors = getAcademyColor(schedule.academyName, false, schedule.childId);
                  const label = isAcademy
                    ? `${schedule.parentName}(${schedule.childName})`
                    : children.find(c => c.id === schedule.childId)?.name;
                  return (
                    <div key={index} className={`flex items-center gap-2 text-sm p-2 rounded ${colors.bg}`}>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{getDayOfWeekName(schedule.dayOfWeek)}</span>
                      <span className="text-muted-foreground">{schedule.startTime}~{schedule.endTime}</span>
                      {!isAcademy && <span className={colors.text}>{schedule.academyName}</span>}
                      {selectedChild === "all" && label && label !== "전체" && (
                        <span className="text-xs text-muted-foreground">({label})</span>
                      )}
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
          <div className="space-y-2">
            {filteredSpecialEvents.length > 0 ? (
              [...filteredSpecialEvents]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
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
