import React, { useState } from "react";
import { Navigation } from "./app/components/navigation.js";
import { AcademyTabs } from "./app/components/academy-tabs.js";
import { AnnouncementBoard } from "./app/components/announcement-board.js";
import { CalendarPage } from "./app/components/calendar-page.js";
import { NotificationPage } from "./app/components/notification-page.js";
import { AuthPage } from "./app/components/auth-page.js";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"parent" | "academy">("parent");
  const [loggedInAcademyId, setLoggedInAcademyId] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<
    "home" | "announcements" | "calendar" | "notifications"
  >("announcements");
  const [selectedAcademy, setSelectedAcademy] = useState("mentor");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(2);

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={(type, academyId) => {
          setUserType(type);
          setLoggedInAcademyId(academyId);
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
        unreadNotificationCount={unreadNotificationCount}
      />

      {currentPage === "announcements" && (
        <>
          {userType === "parent" && (
            <AcademyTabs
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
          />
  
        </div>
      )}

      {currentPage === "calendar" && (
        <div className="flex-1 overflow-auto">
          <CalendarPage />
        </div>
      )}
    </div>
  );
}