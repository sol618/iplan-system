import React, { useState, useEffect } from "react";
import { Bell, PenSquare, Check } from "lucide-react";
import { getParentAcademies } from "./academy-tabs";

interface Notification {
  id: number;
  senderName: string;
  academyName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  parentUserId?: string;
  childName?: string;
  parentName?: string;
}

// ── 회원정보 (캘린더와 동일하게 iplan-users localStorage 공유) ──────────
interface ParentUser {
  name: string;
  userId: string;
  phone: string;
  academy: string;
  childName: string;
}

const DEFAULT_PARENT_USERS: ParentUser[] = [
  { name: "홍길동", userId: "parent123",   phone: "01012345678", academy: "태비태권도",      childName: "홍지우" },
  { name: "김철수", userId: "chulsoo456",  phone: "01098765432", academy: "아이플랜어학원",   childName: "김민재" },
  { name: "박지민", userId: "jimin123",    phone: "01055556666", academy: "멘토학원",        childName: "박서준" },
  { name: "최수아", userId: "sooa456",     phone: "01077778888", academy: "예종피아노학원",   childName: "최하은" },
];

function getParentUsers(): ParentUser[] {
  try {
    const raw = localStorage.getItem("iplan-users");
    return raw ? JSON.parse(raw) : DEFAULT_PARENT_USERS;
  } catch {
    return DEFAULT_PARENT_USERS;
  }
}

// 우리 학원에 등록된 학부모를 userId 기준으로 묶고, 자녀들을 모은다.
// 캘린더에서 추가한 자녀(전역 스케줄)까지 함께 반영한다.
interface AcademyParent {
  userId: string;
  name: string;        // 학부모 이름
  childNames: string[]; // 해당 학부모의 자녀 이름 목록
  phone: string;
}

function getAcademyParents(academyName: string): AcademyParent[] {
  const users = getParentUsers();
  const map = new Map<string, AcademyParent>();

  const addChild = (
    userId: string,
    name: string,
    childName: string | undefined,
    phone: string
  ) => {
    if (!userId) return;
    const existing = map.get(userId);
    if (existing) {
      if (childName && !existing.childNames.includes(childName)) {
        existing.childNames.push(childName);
      }
      if (!existing.name && name) existing.name = name;
      if (!existing.phone && phone) existing.phone = phone;
    } else {
      map.set(userId, {
        userId,
        name: name ?? "",
        childNames: childName ? [childName] : [],
        phone: phone ?? "",
      });
    }
  };

  // 캘린더(전역 스케줄)에 실제 등록된 자녀만 학원의 학생으로 본다.
  // 캘린더 탭과 동일한 기준이므로, 학원 추가 후 정규 스케줄을 삭제하면 알림에서도 함께 사라진다.
  try {
    const raw = localStorage.getItem("iplan-global-schedules");
    const schedules: { parentUserId: string; parentName: string; childName: string; academyName: string }[] =
      raw ? JSON.parse(raw) : [];
    schedules
      .filter(s => s.academyName === academyName)
      .forEach(s => {
        const phone = users.find(u => u.userId === s.parentUserId)?.phone ?? "";
        addChild(s.parentUserId, s.parentName, s.childName, phone);
      });
  } catch {
    /* ignore */
  }

  return Array.from(map.values());
}
// ──────────────────────────────────────────────────────────────────────

// 기본 시드 알림 — userId 기반으로 주소를 명시해 신규 가입자와 동일한 방식으로 연결
const initialNotifications: Notification[] = [
  {
    id: 1,
    senderName: "이관장 관장님",
    academyName: "태비태권도",
    parentUserId: "parent123",
    parentName: "홍길동",
    childName: "홍지우",
    message: "이번 달 수강료 납부 안내입니다. 납부 기한은 5월 25일까지이며, 금액은 150,000원입니다.",
    timestamp: "2026-05-22T12:00:00",
    isRead: false,
  },
  {
    id: 2,
    senderName: "이관장 관장님",
    academyName: "태비태권도",
    parentUserId: "parent123",
    parentName: "홍길동",
    childName: "홍지우",
    message: "지우 이번주 승급 심사있습니다! 금요일 수업 전까지 품새 3단 연습해오면 좋을 것 같습니다.^^",
    timestamp: "2026-04-09T16:45:00",
    isRead: false,
  },
  {
    id: 3,
    senderName: "김민지 선생님",
    academyName: "멘토학원",
    parentUserId: "jimin123",
    parentName: "박지민",
    childName: "박서준",
    message: "5월 학원비 납부 안내입니다. 납부 기한은 4월 25일까지이며, 금액은 350,000원입니다. 계좌이체 또는 카드 결제 가능합니다.",
    timestamp: "2026-04-11T15:20:00",
    isRead: false,
  },
  {
    id: 4,
    senderName: "김민지 선생님",
    academyName: "멘토학원",
    parentUserId: "jimin123",
    parentName: "박지민",
    childName: "박서준",
    message: "다음 주 토요일 레벨테스트 안내입니다. 시간은 오전 11시~12시입니다.",
    timestamp: "2026-04-08T11:20:00",
    isRead: true,
  },
];

let notificationMemory: Notification[] = initialNotifications;

export function NotificationPage({
  onUnreadCountChange,
  userType,
  userId,
  displayName = "",
}: {
  onUnreadCountChange: (count: number) => void;
  userType: "parent" | "academy";
  userId?: string | undefined;
  displayName?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : notificationMemory;
  });
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedAcademyName, setSelectedAcademyName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    notificationMemory = notifications;
  }, [notifications]);

  const isAcademy = userType === "academy";
  const myAcademyName = isAcademy ? displayName : undefined;

  // ── 학원 모드: 우리 학원에 등록된 학부모 목록 (회원가입 + 캘린더 추가 자녀) ──
  const academyParents = isAcademy ? getAcademyParents(myAcademyName ?? "") : [];

  // ── 학원 모드 탭 / 학부모 모드 탭 구성 (학부모별로 자녀 이름을 묶어 표시) ──
  const parentTabs = academyParents.map(p => ({
    userId: p.userId,
    name: `${p.childNames.join(", ")} 학부모`,
  }));

  const myNotifications = isAcademy
    ? notifications.filter(n => n.academyName === myAcademyName)
    : notifications.filter(n => n.parentUserId === userId);

  // 학부모: 실제 등록한 학원만 탭으로 표시 (캘린더와 동일 소스)
  const academyTabNames = isAcademy ? [] : getParentAcademies(userId).map(a => a.name);

  // 선택된 탭 (state가 비어있거나 목록에서 사라졌으면 첫 항목으로 폴백)
  const activeAcademy =
    academyTabNames.includes(selectedAcademyName) ? selectedAcademyName : academyTabNames[0] ?? "";
  const activeParentId =
    parentTabs.some(t => t.userId === selectedParentId) ? selectedParentId : parentTabs[0]?.userId ?? "";

  // ── 화면에 표시할 알림 필터링 ────────────────────────────────────────
  const filteredNotifications = isAcademy
    ? myNotifications.filter(n => n.parentUserId === activeParentId)
    : myNotifications.filter(n => n.academyName === activeAcademy);

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
  const totalUnreadCount = myNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    onUnreadCountChange(isAcademy ? 0 : totalUnreadCount);
  }, [totalUnreadCount, isAcademy, onUnreadCountChange]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        n.parentUserId === userId && n.academyName === activeAcademy
          ? { ...n, isRead: true }
          : n
      )
    );
  };

  const getUnreadCountByAcademy = (academyName: string) =>
    myNotifications.filter(n => n.academyName === academyName && !n.isRead).length;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1>알림</h1>
            {!isAcademy && totalUnreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </div>
          {isAcademy && (
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <PenSquare className="w-5 h-5" />
              <span>알림 보내기</span>
            </button>
          )}
        </div>
        <p className="text-muted-foreground">
          {isAcademy ? "새 알림을 작성하세요" : "선생님으로부터 받은 알림을 확인하세요"}
        </p>
      </div>

      <div className="mb-6 border-b">
        <div className="flex gap-1 overflow-x-auto">
          {!isAcademy
            ? academyTabNames.map(name => {
                const unread = getUnreadCountByAcademy(name);
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedAcademyName(name)}
                    className={`px-6 py-3 whitespace-nowrap transition-colors border-b-2 ${
                      activeAcademy === name
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {name}
                    {unread > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            : parentTabs.map(tab => (
                <button
                  key={tab.userId}
                  onClick={() => setSelectedParentId(tab.userId)}
                  className={`px-6 py-3 whitespace-nowrap transition-colors border-b-2 ${
                    activeParentId === tab.userId
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
        </div>
      </div>

      <div className="bg-card border rounded-lg" style={{ minHeight: "400px" }}>
        <div className="border-b px-4 py-3 flex items-center justify-between bg-accent/30">
          <h3 className="font-medium">
            {isAcademy
              ? parentTabs.find(t => t.userId === activeParentId)?.name ?? "등록된 학부모 없음"
              : activeAcademy}
          </h3>
          {!isAcademy && unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              모두 읽음
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {filteredNotifications.length > 0 ? (
            [...filteredNotifications]
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
              .map((notification, index, arr) => {
                const prevNotification = arr[index - 1];
                const currentDate = new Date(notification.timestamp).toLocaleDateString("ko-KR");
                const prevDate = prevNotification
                  ? new Date(prevNotification.timestamp).toLocaleDateString("ko-KR")
                  : null;
                const showDateDivider = currentDate !== prevDate;

                return (
                  <React.Fragment key={notification.id}>
                    {showDateDivider && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground px-2">
                          {currentDate}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <MessageItem
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      userType={userType}
                    />
                  </React.Fragment>
                );
              })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isAcademy ? "등록된 학부모가 없거나 보낸 알림이 없습니다" : "받은 알림이 없습니다"}</p>
            </div>
          )}
        </div>
      </div>

      <WriteNotificationModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        academyName={myAcademyName ?? ""}
        parents={academyParents}
        onSend={(newNotifications) => {
          setNotifications(prev => [...prev, ...newNotifications]);
        }}
      />
    </div>
  );
}

function MessageItem({
  notification,
  onMarkAsRead,
  userType,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  userType: "parent" | "academy";
}) {
  const date = new Date(notification.timestamp);
  const timeString = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (userType === "academy") {
    return (
      <div className="flex justify-end p-3">
        <div className="max-w-[75%]">
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {notification.message}
            </p>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-muted-foreground">{timeString}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3 cursor-pointer hover:bg-accent/20 p-3 rounded-lg transition-colors"
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-medium text-primary">
          {notification.senderName.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-sm">{notification.senderName}</span>
        </div>
        <div
          className={`inline-block max-w-full px-4 py-2 rounded-2xl ${
            notification.isRead ? "bg-accent" : "bg-primary/10 border border-primary/20"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {notification.message}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{timeString}</span>
          {notification.isRead && <Check className="w-3 h-3 text-muted-foreground" />}
        </div>
      </div>
    </div>
  );
}

function WriteNotificationModal({
  isOpen,
  onClose,
  academyName,
  parents,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  academyName: string;
  parents: AcademyParent[];
  onSend: (notifications: Notification[]) => void;
}) {
  const [message, setMessage] = useState("");
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [errors, setErrors] = useState({ parents: "", message: "" });

  const handleToggleParent = (parentUserId: string) => {
    setErrors(prev => ({ ...prev, parents: "" }));
    setSelectedParents(prev =>
      prev.includes(parentUserId)
        ? prev.filter(id => id !== parentUserId)
        : [...prev, parentUserId]
    );
  };

  const handleSelectAll = () => {
    setErrors(prev => ({ ...prev, parents: "" }));
    if (selectAll) {
      setSelectedParents([]);
    } else {
      setSelectedParents(parents.map(p => p.userId));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { parents: "", message: "" };
    let isValid = true;

    if (selectedParents.length === 0) {
      newErrors.parents = "알림을 받을 학부모를 선택해주세요.";
      isValid = false;
    }
    if (!message.trim()) {
      newErrors.message = "알림 내용을 입력해주세요.";
      isValid = false;
    } else if (message.trim().length > 300) {
      newErrors.message = "알림 내용은 300자 이하로 작성해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    const timestamp = new Date().toISOString();
    const newNotifications: Notification[] = selectedParents.map(parentUserId => {
      const parent = parents.find(p => p.userId === parentUserId)!;
      return {
        id: Date.now() + Math.random(),
        senderName: academyName,
        academyName,
        message,
        timestamp,
        isRead: false,
        parentUserId,
        parentName: parent.name,
        childName: parent.childNames.join(", "),
      };
    });

    onSend(newNotifications);

    setMessage("");
    setSelectedParents([]);
    setSelectAll(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border rounded-lg shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <h2>알림 보내기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <span className="sr-only">닫기</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block">
                학부모 선택 ({selectedParents.length}/{parents.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-primary hover:underline"
              >
                {selectAll ? "전체 해제" : "전체 선택"}
              </button>
            </div>
            <div
              className={`border rounded-lg max-h-64 overflow-y-auto ${
                errors.parents ? "border-destructive" : "border-border"
              }`}
            >
              {parents.length > 0 ? (
                parents.map(parent => (
                  <label
                    key={parent.userId}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParents.includes(parent.userId)}
                      onChange={() => handleToggleParent(parent.userId)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{parent.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({parent.childNames.join(", ")})
                        </span>
                      </div>
                      {parent.phone && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {parent.phone}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                  등록된 학부모가 없습니다
                </p>
              )}
            </div>
          </div>
          {errors.parents && (
            <p className="mt-1.5 text-sm font-medium text-destructive">{errors.parents}</p>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="message">메시지</label>
              <span
                className={`text-xs ${
                  message.length > 300 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {message.length} / 300자
              </span>
            </div>
            <textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors(prev => ({ ...prev, message: "" }));
              }}
              placeholder="학부모님께 전달할 메시지를 입력하세요"
              rows={6}
              className={`w-full px-4 py-2.5 bg-input-background border rounded-lg resize-none focus:outline-none focus:ring-2 ${
                errors.message || message.length > 300
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-ring"
              }`}
            />
            {errors.message && (
              <p className="mt-1.5 text-sm font-medium text-destructive">{errors.message}</p>
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
              전송 ({selectedParents.length}명)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
