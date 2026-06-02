import React, { useState } from "react";
import { Navigation } from "./app/components/navigation.js";
import { AcademyTabs, getParentAcademies } from "./app/components/academy-tabs.js";
import { AnnouncementBoard } from "./app/components/announcement-board.js";
import { CalendarPage, ensureSeeded } from "./app/components/calendar-page.js";
import { NotificationPage } from "./app/components/notification-page.js";
import { AuthPage } from "./app/components/auth-page.js";

// 로그인한 학부모(userId)에게 도착한 안 읽은 알림 개수
function countUnreadForUser(userId?: string): number {
  if (!userId) return 0;
  try {
    const saved = localStorage.getItem("notifications");
    if (!saved) return 0;
    const notifications = JSON.parse(saved);
    return notifications.filter((n: any) => !n.isRead && n.parentUserId === userId).length;
  } catch {
    return 0;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"parent" | "academy">("parent");
  const [loggedInAcademyId, setLoggedInAcademyId] = useState<string | undefined>(undefined);
  const [loggedInUserId, setLoggedInUserId] = useState<string | undefined>(undefined);
  const [loggedInName, setLoggedInName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<
    "home" | "announcements" | "calendar" | "notifications"
  >("announcements");
  const [selectedAcademy, setSelectedAcademy] = useState("mentor");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={(type, academyId, userId, name) => {
          // 어떤 탭을 먼저 열든 학원 계정에서 모든 학생이 보이도록, 로그인 시 전역 스케줄을 시딩한다.
          ensureSeeded();
          setUserType(type);
          setLoggedInAcademyId(academyId);
          setLoggedInUserId(userId);
          setLoggedInName(name ?? "");
          setUnreadNotificationCount(type === "parent" ? countUnreadForUser(userId) : 0);
          if (type === "parent") {
            const acs = getParentAcademies(userId);
            if (acs[0]) setSelectedAcademy(acs[0].id);
          }
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="size-full bg-background flex flex-col">
      <Navigation
  currentPage={currentPage}
  onNavigate={setCurrentPage}
  unreadNotificationCount={userType === "academy" ? 0 : unreadNotificationCount}
/>

      {currentPage === "announcements" && (
        <>
          {userType === "parent" && (
            <AcademyTabs
              academies={getParentAcademies(loggedInUserId)}
              selectedAcademy={selectedAcademy}
              onSelectAcademy={setSelectedAcademy}
            />
          )}
          <div className="flex-1 overflow-auto">
            <AnnouncementBoard
              academyId={userType === "academy" ? loggedInAcademyId! : selectedAcademy}
              userType={userType}
            />
          </div>
        </>
      )}

      {currentPage === "notifications" && (
  <div className="flex-1 overflow-auto">
    <NotificationPage
      onUnreadCountChange={setUnreadNotificationCount}
      userType={userType}
      userId={loggedInUserId}
      displayName={loggedInName}
    />
  </div>
)}

      {currentPage === "calendar" && (
        <div className="flex-1 overflow-auto">
          <CalendarPage
            userId={loggedInUserId}
            userType={userType}
            displayName={loggedInName}
          />
        </div>
      )}
    </div>
  );
}