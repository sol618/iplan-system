import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { DayScheduleModal } from "./day-schedule-modal";
import { EditScheduleModal } from "./edit-schedule-modal";
import { AddAcademyModal } from "./add-academy-modal";

interface Child {
  id: string;
  name: string;
}

interface RegularSchedule {
  dayOfWeek: number; // 0 = 일요일, 1 = 월요일, ...
  academyName: string;
  startTime: string;
  endTime: string;
  childId: string;
}

interface SpecialEvent {
  date: string;
  title: string;
  academyName: string;
  startTime: string;
  endTime: string;
  childId: string;
}

const children: Child[] = [
  { id: "all", name: "전체" },
  { id: "child1", name: "큰아이" },
  { id: "child2", name: "둘째" },
];

const initialRegularSchedules: RegularSchedule[] = [
  { dayOfWeek: 3, academyName: "예종피아노학원", startTime: "16:00", endTime: "19:00", childId: "child1" },
  { dayOfWeek: 4, academyName: "예종피아노학원", startTime: "16:00", endTime: "19:00", childId: "child1" },
  { dayOfWeek: 2, academyName: "멘토학원", startTime: "18:00", endTime: "21:00", childId: "child1" },
  { dayOfWeek: 5, academyName: "멘토학원", startTime: "18:00", endTime: "21:00", childId: "child1" },
  { dayOfWeek: 1, academyName: "태비태권도", startTime: "17:00", endTime: "19:00", childId: "child2" },
  { dayOfWeek: 3, academyName: "태비태권도", startTime: "17:00", endTime: "19:00", childId: "child2" },
];

const initialSpecialEvents: SpecialEvent[] = [
  {
    date: "2026-04-12",
    title: "레벨테스트",
    academyName: "멘토학원",
    startTime: "11:00",
    endTime: "12:00",
    childId: "child1"
  },
  {
    date: "2026-04-15",
    title: "피아노 연주회",
    academyName: "예종피아노학원",
    startTime: "14:00",
    endTime: "16:00",
    childId: "child1"
  },
  {
    date: "2026-04-20",
    title: "학부모 상담",
    academyName: "멘토학원",
    startTime: "19:00",
    endTime: "20:00",
    childId: "child1"
  },
  {
    date: "2026-04-18",
    title: "태권도 발표회",
    academyName: "태비태권도",
    startTime: "18:00",
    endTime: "19:00",
    childId: "child2"
  },
];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // 2026년 4월
  const [regularSchedules, setRegularSchedules] = useState<RegularSchedule[]>(initialRegularSchedules);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>(initialSpecialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentMonth = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  const filteredRegularSchedules = selectedChild === "all"
    ? regularSchedules
    : regularSchedules.filter(s => s.childId === selectedChild);

  const filteredSpecialEvents = selectedChild === "all"
    ? specialEvents
    : specialEvents.filter(e => e.childId === selectedChild);

  const getSchedulesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const regularSchedule = filteredRegularSchedules.filter(s => s.dayOfWeek === dayOfWeek);
    const specialEvent = filteredSpecialEvents.filter(e => e.date === dateString);

    return { regularSchedule, specialEvent };
  };

  const getDayOfWeekName = (dayOfWeek: number) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayOfWeek];
  };

  const getAcademyColor = (academyName: string, isSpecialEvent: boolean = false, childId?: string) => {
    // 둘째 자녀의 색상 (초록색 계열)
    if (childId === "child2") {
      if (isSpecialEvent) {
        return {
          bg: "bg-emerald-400/25",
          text: "text-emerald-800 dark:text-emerald-200",
          border: "border-emerald-400 dark:border-emerald-600"
        };
      }
      return {
        bg: "bg-emerald-100/80 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800"
      };
    }

    // 큰아이 자녀의 색상 (기존 학원별 색상)
    if (academyName.includes("멘토")) {
      if (isSpecialEvent) {
        return {
          bg: "bg-sky-400/25",
          text: "text-sky-800 dark:text-sky-200",
          border: "border-sky-400 dark:border-sky-600"
        };
      }
      return {
        bg: "bg-sky-100/80 dark:bg-sky-900/20",
        text: "text-sky-700 dark:text-sky-300",
        border: "border-sky-200 dark:border-sky-800"
      };
    } else if (academyName.includes("예종")) {
      if (isSpecialEvent) {
        return {
          bg: "bg-pink-400/25",
          text: "text-pink-800 dark:text-pink-200",
          border: "border-pink-400 dark:border-pink-600"
        };
      }
      return {
        bg: "bg-pink-500/10",
        text: "text-pink-700 dark:text-pink-300",
        border: "border-pink-200 dark:border-pink-800"
      };
    }
    return {
      bg: "bg-gray-500/10",
      text: "text-gray-700 dark:text-gray-300",
      border: "border-gray-200 dark:border-gray-800"
    };
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleEditSchedule = (schedule: any) => {
    setScheduleToEdit(schedule);
    setIsDayModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleAddAcademy = (newSchedules: RegularSchedule[]) => {
    setRegularSchedules(prev => [...prev, ...newSchedules]);
  };

  const handleSaveSchedule = (updatedSchedule: any) => {
    if (updatedSchedule === null) {
      // 삭제
      if (scheduleToEdit.type === "regular") {
        setRegularSchedules(prev =>
          prev.filter(s =>
            !(s.dayOfWeek === scheduleToEdit.dayOfWeek &&
              s.academyName === scheduleToEdit.academyName &&
              s.startTime === scheduleToEdit.startTime &&
              s.childId === scheduleToEdit.childId)
          )
        );
      } else {
        setSpecialEvents(prev =>
          prev.filter(e =>
            !(e.date === scheduleToEdit.date &&
              e.title === scheduleToEdit.title &&
              e.academyName === scheduleToEdit.academyName &&
              e.childId === scheduleToEdit.childId)
          )
        );
      }
    } else {
      // 수정
      if (updatedSchedule.type === "regular") {
        setRegularSchedules(prev =>
          prev.map(s =>
            s.dayOfWeek === scheduleToEdit.dayOfWeek &&
            s.academyName === scheduleToEdit.academyName &&
            s.startTime === scheduleToEdit.startTime &&
            s.childId === scheduleToEdit.childId
              ? { ...s, ...updatedSchedule }
              : s
          )
        );
      } else {
        setSpecialEvents(prev =>
          prev.map(e =>
            e.date === scheduleToEdit.date &&
            e.title === scheduleToEdit.title &&
            e.academyName === scheduleToEdit.academyName &&
            e.childId === scheduleToEdit.childId
              ? { ...e, ...updatedSchedule }
              : e
          )
        );
      }
    }
  };

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6" />
            <h1>학원 일정</h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            title="학원 추가"
          >
            <Plus className="w-5 h-5" />
            <span>학원 추가</span>
          </button>
        </div>
        <p className="text-muted-foreground">자녀의 학원 스케줄과 행사를 확인하세요</p>
      </div>

      <div className="mb-6 border-b">
        <div className="flex gap-1">
          {children.map((child) => (
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

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <h3 className="mb-3">정규 스케줄</h3>
          <div className="space-y-2">
            {filteredRegularSchedules.length > 0 ? (
              filteredRegularSchedules
                .sort((a, b) => {
                  // 월(1), 화(2), 수(3), 목(4), 금(5), 토(6), 일(0) 순서로 정렬
                  const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                  const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                  return orderA - orderB;
                })
                .map((schedule, index) => {
                  const colors = getAcademyColor(schedule.academyName, false, schedule.childId);
                  const childName = children.find(c => c.id === schedule.childId)?.name;
                  return (
                    <div key={index} className={`flex items-center gap-2 text-sm p-2 rounded ${colors.bg}`}>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{getDayOfWeekName(schedule.dayOfWeek)}</span>
                      <span className="text-muted-foreground">{schedule.startTime}~{schedule.endTime}</span>
                      <span className={colors.text}>{schedule.academyName}</span>
                      {selectedChild === "all" && childName && childName !== "전체" && (
                        <span className="text-xs text-muted-foreground">({childName})</span>
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
              filteredSpecialEvents.slice(0, 3).map((event, index) => {
                const colors = getAcademyColor(event.academyName, true, event.childId);
                const [year, month, day] = event.date.split('-');
                const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const childName = children.find(c => c.id === event.childId)?.name;
                return (
                  <div key={index} className={`text-sm p-2 rounded ${colors.bg}`}>
                    <div className="flex items-center gap-2">
                      <div className="font-bold">{event.title}</div>
                      {selectedChild === "all" && childName && childName !== "전체" && (
                        <span className="text-xs text-muted-foreground">({childName})</span>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {eventDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} {event.startTime}~{event.endTime}
                    </div>
                    <div className={`text-sm ${colors.text}`}>{event.academyName}</div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">다가오는 행사가 없습니다</p>
            )}
          </div>
        </div>
      </div>

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

            const { regularSchedule, specialEvent } = isCurrentMonth ? getSchedulesForDate(date) : { regularSchedule: [], specialEvent: [] };

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
                      date.getDay() === 6 ? "text-blue-600 dark:text-blue-400" :
                      ""
                    }`}>{dayNumber}</span>
                    <div className="space-y-1 text-xs">
                      {regularSchedule.map((schedule, idx) => {
                        const colors = getAcademyColor(schedule.academyName, false, schedule.childId);
                        return (
                          <div key={idx} className={`${colors.bg} ${colors.text} rounded px-1 py-0.5 truncate`}>
                            {schedule.startTime.slice(0, 5)} {schedule.academyName.replace('학원', '')}
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

      <AddAcademyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAcademy}
      />

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
            />
          )}
        </>
      )}
    </div>
  );
}
