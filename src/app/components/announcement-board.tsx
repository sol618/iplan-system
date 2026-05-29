import React, { useState } from "react";
import { Megaphone, Pin, PenSquare, Trash2, Edit, X } from "lucide-react";
import { WriteAnnouncementModal } from "./write-announcement-modal";
import { EditAnnouncementModal } from "./edit-announcement-modal";
import { academies } from "./academy-tabs";

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
  author?: string;
  academyId: string;
}

interface NewAnnouncementInput {
  title: string;
  content: string;
  isPinned: boolean;
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "여름방학 특강 안내",
    content: "7월 22일부터 8월 16일까지 여름방학 수학 특강이 진행됩니다. 중등 심화부터 고등 수능 과정까지 단계별 수업을 운영하오니 많은 참여 부탁드립니다.",
    date: "2026-04-08",
    isPinned: true,
    author: "멘토학원",
    academyId: "mentor"
  },
  {
    id: 2,
    title: "5월 모의고사 일정 변경",
    content: "5월 15일 예정이었던 수학 모의고사가 5월 22일로 변경되었습니다. 일정 확인 부탁드립니다.",
    date: "2026-04-07",
    isPinned: true,
    author: "멘토학원",
    academyId: "mentor"
  },
  {
    id: 3,
    title: "자습실 이용 시간 안내",
    content: "평일 자습실 이용 시간은 오후 2시부터 10시까지입니다. 주말은 오전 9시부터 오후 6시까지 운영됩니다.",
    date: "2026-04-05",
    author: "멘토학원",
    academyId: "mentor"
  },
  {
    id: 4,
    title: "4월 학부모 상담 주간",
    content: "4월 15일부터 19일까지 학부모 상담 주간을 운영합니다. 개별 상담 예약은 학원 사무실로 연락 주시기 바랍니다.",
    date: "2026-04-03",
    author: "멘토학원",
    academyId: "mentor"
  },
  {
    id: 5,
    title: "신규 강좌 개설 안내",
    content: "고등부 미적분 심화 과정이 신규 개설되었습니다. 수강 신청 문의는 학원으로 연락 주시기 바랍니다.",
    date: "2026-04-01",
    author: "멘토학원",
    academyId: "mentor"
  },
  {
    id: 6,
    title: "중간고사 대비반 모집",
    content: "5월 중간고사를 대비한 특별반을 모집합니다. 국어, 수학, 영어 집중 관리 프로그램입니다.",
    date: "2026-04-06",
    author: "멘토학원",
    academyId: "mentor"
  },
  {
    id: 7,
    title: "정기 연주회 안내",
    content: "5월 15일 오후 2시 학원 정기 연주회가 개최됩니다. 학부모님들의 많은 참석 부탁드립니다.",
    date: "2026-04-08",
    isPinned: true,
    author: "예종피아노학원",
    academyId: "yejong"
  },
  {
    id: 8,
    title: "피아노 콩쿠르 참가 안내",
    content: "6월 전국 청소년 피아노 콩쿠르에 학원생들이 참가합니다. 참가 관련 문의는 학원으로 연락 주시기 바랍니다.",
    date: "2026-04-05",
    author: "예종피아노학원",
    academyId: "yejong"
  },
  {
    id: 9,
    title: "연습실 추가 개방",
    content: "주말 연습실 이용 시간을 확대합니다. 토요일 오전 9시부터 오후 9시까지 이용 가능합니다.",
    date: "2026-04-03",
    author: "예종피아노학원",
    academyId: "yejong"
  },
  {
    id: 10,
    title: "신규 강사 채용 안내",
    content: "클래식 전공 강사님이 새롭게 합류하셨습니다. 4월부터 클래식 심화반 수업이 시작됩니다.",
    date: "2026-04-02",
    author: "예종피아노학원",
    academyId: "yejong"
  },
  {
    id: 11,
    title: "학원 발표회 준비",
    content: "6월 정기 발표회 준비가 시작됩니다. 곡 선정 및 연습 일정은 개별 공지 예정입니다.",
    date: "2026-04-01",
    author: "예종피아노학원",
    academyId: "yejong"
  }
];

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

interface AnnouncementBoardProps {
  academyId: string;
  userType: "parent" | "academy";
}

export function AnnouncementBoard({ academyId, userType }: AnnouncementBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const academyAnnouncements = announcements.filter(a => a.academyId === academyId);
  const pinnedAnnouncements = academyAnnouncements
    .filter(a => a.isPinned)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const regularAnnouncements = academyAnnouncements
    .filter(a => !a.isPinned)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentAcademy = academies.find(a => a.id === academyId);

  const handleCreateAnnouncement = (newAnnouncement: NewAnnouncementInput) => {
    setAnnouncements(prev => {
      const nextId = Math.max(0, ...prev.map(a => a.id)) + 1;

      return [
        {
          id: nextId,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          date: getTodayDateString(),
          isPinned: newAnnouncement.isPinned,
          author: currentAcademy?.name || "관리자",
          academyId,
        },
        ...prev,
      ];
    });
  };

  const handleDeleteAnnouncement = (id: number) => {
    if (confirm("정말 이 공지사항을 삭제하시겠습니까?")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setSelectedAnnouncement(prev => prev?.id === id ? null : prev);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedAnnouncement: Announcement) => {
    setAnnouncements(prev =>
      prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a)
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Megaphone className="w-6 h-6" />
            <h1>공지사항</h1>
          </div>
          {userType === "academy" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <PenSquare className="w-5 h-5" />
              <span>공지 작성</span>
            </button>
          )}
        </div>
        <p className="text-muted-foreground">학원의 주요 소식과 일정을 확인하세요</p>
      </div>

      <WriteAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        academyName={currentAcademy?.name || ""}
        onSubmit={handleCreateAnnouncement}
      />

      {editingAnnouncement && (
        <EditAnnouncementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAnnouncement(null);
          }}
          announcement={editingAnnouncement}
          onSave={handleSaveEdit}
        />
      )}

      <div className="space-y-6">
        {pinnedAnnouncements.length > 0 && (
          <div className="space-y-3">
            {pinnedAnnouncements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                userType={userType}
                onDelete={handleDeleteAnnouncement}
                onEdit={handleEditAnnouncement}
                onOpen={setSelectedAnnouncement}
              />
            ))}
          </div>
        )}

        {regularAnnouncements.length > 0 && (
          <div className="space-y-3">
            {regularAnnouncements.map((announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                userType={userType}
                onDelete={handleDeleteAnnouncement}
                onEdit={handleEditAnnouncement}
                onOpen={setSelectedAnnouncement}
              />
            ))}
          </div>
        )}
      </div>

      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}

function AnnouncementItem({
  announcement,
  userType,
  onDelete,
  onEdit,
  onOpen,
}: {
  announcement: Announcement;
  userType: "parent" | "academy";
  onDelete: (id: number) => void;
  onEdit: (announcement: Announcement) => void;
  onOpen: (announcement: Announcement) => void;
}) {
  return (
    <div
      onClick={() => onOpen(announcement)}
      className={`p-5 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
        announcement.isPinned ? "bg-accent border-primary/20" : "bg-card"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.currentTarget !== e.target) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(announcement);
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-1">
          {announcement.isPinned && (
            <Pin className="w-4 h-4 text-primary flex-shrink-0" />
          )}
          <h3 className="flex-1">{announcement.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <time className="text-sm text-muted-foreground whitespace-nowrap">
            {new Date(announcement.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {userType === "academy" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(announcement);
                }}
                className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                title="공지 수정"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(announcement.id);
                }}
                className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                title="공지 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-foreground/80 mb-3 leading-relaxed">
        {announcement.content}
      </p>

      {announcement.author && (
        <div className="text-sm text-muted-foreground">
          작성자: {announcement.author}
        </div>
      )}
    </div>
  );
}

function AnnouncementDetailModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <article className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border rounded-lg shadow-lg">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {announcement.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm text-primary">
                  <Pin className="w-3.5 h-3.5" />
                  상단 고정
                </span>
              )}
              <time className="text-sm text-muted-foreground">
                {new Date(announcement.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <h2 className="leading-snug">{announcement.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
            {announcement.content}
          </p>

          {announcement.author && (
            <div className="pt-4 border-t text-sm text-muted-foreground">
              작성자: {announcement.author}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
