import React from "react";
import { X, Clock, Plus } from "lucide-react";

interface RegularSchedule {
  dayOfWeek: number;
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

interface DayScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  regularSchedules: RegularSchedule[];
  specialEvents: SpecialEvent[];
  onEditSchedule: (schedule: any) => void;
  onAddSchedule: () => void;
  getAcademyColor: (academyName: string, isSpecialEvent?: boolean, childId?: string) => { bg: string; text: string; border: string };
}

export function DayScheduleModal({
  isOpen,
  onClose,
  date,
  regularSchedules,
  specialEvents,
  onEditSchedule,
  onAddSchedule,
  getAcademyColor,
}: DayScheduleModalProps) {
  if (!isOpen) return null;

  const dateString = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2>{dateString}</h2>
            <p className="text-sm text-muted-foreground">일정 확인 및 수정</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {regularSchedules.length === 0 && specialEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 일정이 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {regularSchedules.map((schedule, index) => {
                const colors = getAcademyColor(schedule.academyName, false, schedule.childId);
                return (
                  <button
                    key={`regular-${index}`}
                    onClick={() => onEditSchedule({ ...schedule, type: "regular" })}
                    className={`w-full text-left p-4 rounded-lg border ${colors.bg} ${colors.border} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className={`font-medium ${colors.text}`}>
                          {schedule.academyName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{schedule.startTime} ~ {schedule.endTime}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          정규 수업
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {specialEvents.map((event, index) => {
                const colors = getAcademyColor(event.academyName, true, event.childId);
                return (
                  <button
                    key={`special-${index}`}
                    onClick={() => onEditSchedule({ ...event, type: "special" })}
                    className={`w-full text-left p-4 rounded-lg border ${colors.bg} ${colors.border} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        <div className={`text-sm ${colors.text} mt-1`}>
                          {event.academyName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{event.startTime} ~ {event.endTime}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={onAddSchedule}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>일정 추가</span>
          </button>
        </div>
      </div>
    </div>
  );
}
