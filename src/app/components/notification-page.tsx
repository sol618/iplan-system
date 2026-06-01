import React, { useState, useEffect } from "react";
import { Bell, PenSquare, Check } from "lucide-react";



interface Notification {
  id: number;
  senderName: string;
  academyName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  childName?: string;
  parentName?: string;
}

interface Academy {
  id: string;
  name: string;
}

const academies: Academy[] = [
  { id: "mentor", name: "멘토학원" },
  { id: "yejong", name: "예종피아노학원" },
  { id: "taeby", name: "태비태권도" },
];

const initialNotifications: Notification[] = [
  {
    id: 1,
    senderName: "김민지 선생님",
    academyName: "멘토학원",
    message: "5월 학원비 납부 안내입니다. 납부 기한은 4월 25일까지이며, 금액은 350,000원입니다. 계좌이체 또는 카드 결제 가능합니다.",
    timestamp: "2026-04-11T15:20:00",
    isRead: false,
    childName: "아들"
  },
  {
    id: 2,
    senderName: "김민지 선생님",
    academyName: "멘토학원",
    message: "다음 주 월요일은 임시 휴원입니다. 참고 부탁드립니다.",
    timestamp: "2026-04-11T14:30:00",
    isRead: false,
    childName: "아들"
  },
  {
    id: 3,
    senderName: "이관장 관장님",
    academyName: "태비태권도",
    message: "이번 달 수강료 납부 안내입니다. 납부 기한은 5월 25일까지이며, 금액은 150,000원입니다.",
    timestamp: "2026-05-22T12:00:00",
    isRead: true,
    childName: "아들",
    parentName: "홍지우 학부모"
  },
  {
    id: 4,
    senderName: "김민지 선생님",
    academyName: "멘토학원",
    message: "다음 주 토요일 레벨테스트 안내입니다. 시간은 오전 11시~12시입니다.",
    timestamp: "2026-04-08T11:20:00",
    isRead: true,
    childName: "아들"
  },
   {
    id: 5,
    senderName: "이관장 관장님",
    academyName: "태비태권도",
    message: "지우 이번주 승급 심사있습니다! 금요일 수업 전까지 품새 3단 연습해오면 좋을 것 같습니다.^^",
    timestamp: "2026-04-09T16:45:00",
    isRead: true,
    childName: "아들",
    parentName: "홍지우 학부모"
  },
  {
  id: 6,
  senderName: "이관장 관장님",
  academyName: "태비태권도",
  message: "하은이가 오늘 발차기 자세를 아주 열심히 연습했습니다. 집에서도 많이 칭찬해 주세요.^^",
  timestamp: "2026-05-25T18:30:00",
  isRead: true,
  childName: "하은이",
  parentName: "이하은 학부모"
},
];
let notificationMemory: Notification[] = initialNotifications;

export function NotificationPage({
  onUnreadCountChange,
  userType,
}: {
  onUnreadCountChange: (count: number) => void;
  userType: "parent" | "academy";
}) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
  const saved = localStorage.getItem("notifications");
  return saved ? JSON.parse(saved) : notificationMemory;
});
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(
  userType === "academy" ? "taeby" : "mentor"
  );
  const [selectedParent, setSelectedParent] = useState("홍지우 학부모");
  const [currentAcademyForModal, setCurrentAcademyForModal] = useState("");
  useEffect(() => {
  localStorage.setItem("notifications", JSON.stringify(notifications));
}, [notifications]);

  const filteredNotifications = notifications.filter((n) => {
  if (userType === "academy") {
    return n.parentName === selectedParent;
  }

  return (
    n.academyName === academies.find(a => a.id === selectedAcademy)?.name &&
    n.childName !== "하은이"
  );
});

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
  const totalUnreadCount = notifications.filter(n => !n.isRead).length;
  useEffect(() => {
  onUnreadCountChange(totalUnreadCount);
}, [totalUnreadCount, onUnreadCountChange]);

useEffect(() => {
  notificationMemory = notifications;
}, [notifications]);


  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        n.academyName === academies.find(a => a.id === selectedAcademy)?.name
          ? { ...n, isRead: true }
          : n
      )
    );
  };

  const getUnreadCountByAcademy = (academyName: string) => {
    return notifications.filter(n => n.academyName === academyName && !n.isRead).length;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h1>알림</h1>
            {userType === "parent" && totalUnreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </div>
          {userType === "academy" && (
          <button
            onClick={() => {
              setCurrentAcademyForModal(academies.find(a => a.id === selectedAcademy)?.name || "");
              setIsWriteModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <PenSquare className="w-5 h-5" />
            <span>알림 보내기</span>
          </button> )}
        </div>
        <p className="text-muted-foreground">{userType === "academy"
  ? "새 알림을 작성하세요"
  : "선생님으로부터 받은 알림을 확인하세요"}</p>
      </div>
      

    <div className="mb-6 border-b">
  <div className="flex gap-1">
    {userType === "parent" ? (
      academies.map((academy) => {
        const unread = getUnreadCountByAcademy(academy.name);
        return (
          <button
            key={academy.id}
            onClick={() => setSelectedAcademy(academy.id)}
            className={`px-6 py-3 whitespace-nowrap transition-colors border-b-2 ${
              selectedAcademy === academy.id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {academy.name}
            {unread > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {unread}
              </span>
            )}
          </button>
        );
      })
    ) : (
      <>
        <button
  onClick={() => setSelectedParent("홍지우 학부모")}
  className={`px-6 py-3 border-b-2 ${
    selectedParent === "홍지우 학부모"
      ? "border-primary text-primary font-medium"
      : "border-transparent text-muted-foreground"
  }`}
>
  홍지우 학부모
</button>

<button
  onClick={() => setSelectedParent("이하은 학부모")}
  className={`px-6 py-3 border-b-2 ${
    selectedParent === "이하은 학부모"
      ? "border-primary text-primary font-medium"
      : "border-transparent text-muted-foreground"
  }`}
>
  이하은 학부모
</button>
      </>
    )}
  </div>
</div>

    

      <div className="bg-card border rounded-lg" style={{ minHeight: '400px' }}>
        <div className="border-b px-4 py-3 flex items-center justify-between bg-accent/30">
          <h3 className="font-medium">
  {userType === "academy"
    ? selectedParent
    : academies.find(a => a.id === selectedAcademy)?.name}
</h3>
          {userType === "parent" && unreadCount > 0 && (
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
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    )
    .map((notification, index, arr) => {
              const prevNotification = arr[index - 1];
              const currentDate = new Date(notification.timestamp).toLocaleDateString('ko-KR');
              const prevDate = prevNotification ? new Date(prevNotification.timestamp).toLocaleDateString('ko-KR') : null;
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
              <p>받은 알림이 없습니다</p>
            </div>
          )}
        </div>
      </div>

      <WriteNotificationModal
  isOpen={isWriteModalOpen}
  onClose={() => setIsWriteModalOpen(false)}
  academyName={currentAcademyForModal}
  selectedParent={selectedParent}
  onSend={(newNotification) => {
    setNotifications((prev) => [
  ...prev,
  {
    ...newNotification,
    senderName: "이관장 관장님",
    childName: "아들",
  },
]);
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
  const timeString = date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
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
        <div className={`inline-block max-w-full px-4 py-2 rounded-2xl ${
          notification.isRead
            ? "bg-accent"
            : "bg-primary/10 border border-primary/20"
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {notification.message}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{timeString}</span>
          {notification.isRead && (
            <Check className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

interface Parent {
  id: string;
  name: string;
  children: string[];
  phone: string;
}

const parentsList: Parent[] = [
  { id: "p1", name: "홍길동", children: ["홍지우"], phone: "010-1234-5678" },
  { id: "p2", name: "이수진", children: ["이하은"], phone: "010-2345-6789" },
  { id: "p3", name: "박민수", children: ["박지우", "박지호"], phone: "010-3456-7890" },
  { id: "p4", name: "최영희", children: ["최민재"], phone: "010-4567-8901" },
  { id: "p5", name: "정은영", children: ["정서윤"], phone: "010-5678-9012" },
  { id: "p6", name: "강동원", children: ["강예준"], phone: "010-6789-0123" },
  { id: "p7", name: "윤서연", children: ["윤지안"], phone: "010-7890-1234" },
  { id: "p8", name: "한지민", children: ["한수아", "한수빈"], phone: "010-8901-2345" },
];

function WriteNotificationModal({
  isOpen,
  onClose,
  academyName,
  selectedParent,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  academyName: string;
  selectedParent: string;
  onSend: (notification: Notification) => void;
}) {
  const [message, setMessage] = useState("");
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [parentError, setParentError] = useState(false)
  const [messageError, setMessageError] = useState(false)
  const [selectAll, setSelectAll] = useState(false);
  const [errors, setErrors] = useState({
  parents: "",
  message: "",
});

  const handleToggleParent = (parentId: string) => {
  setErrors(prev => ({ ...prev, parents: "" }));

  setSelectedParents(prev =>
    prev.includes(parentId)
      ? prev.filter(id => id !== parentId)
      : [...prev, parentId]
  );
};

  
  const handleSelectAll = () => {
  setErrors(prev => ({ ...prev, parents: "" }));

  if (selectAll) {
    setSelectedParents([]);
  } else {
    setSelectedParents(parentsList.map(p => p.id));
  }
  setSelectAll(!selectAll);
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
  parents: "",
  message: "",
};

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
    const newNotification: Notification = {
  id: Date.now(),
  senderName: "태비태권도",
  academyName: academyName,
  message,
  timestamp: new Date().toISOString(),
  isRead: false,
  parentName: selectedParents.includes("p2")
  ? "이하은 학부모"
  : "홍지우 학부모",

  childName: selectedParents.includes("p2")
    ? "하은이"
    : "지우",
};

onSend(newNotification);

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
                학부모 선택 ({selectedParents.length}/{parentsList.length})
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
              {parentsList.map((parent) => (
                <label
                  key={parent.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedParents.includes(parent.id)}
                    onChange={() => handleToggleParent(parent.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{parent.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({parent.children.join(", ")})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {parent.phone}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
              {errors.parents && (
  <p className="mt-1.5 text-sm font-medium text-destructive">
    {errors.parents}
  </p>
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
  <p className="mt-1.5 text-sm font-medium text-destructive">
    {errors.message}
  </p>
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
