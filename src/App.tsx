import React, { useState } from "react";
import { Navigation } from "./app/components/navigation.js";
import { AcademyTabs } from "./app/components/academy-tabs.js";
import { AnnouncementBoard } from "./app/components/announcement-board.js";
import { CalendarPage } from "./app/components/calendar-page.js";
import { NotificationPage } from "./app/components/notification-page.js";
import { AuthPage } from "./app/components/auth-page.js";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<
    "home" | "announcements" | "calendar" | "notifications"
  >("announcements");
  const [selectedAcademy, setSelectedAcademy] = useState("mentor");

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="size-full bg-background flex flex-col">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        unreadNotificationCount={2}
      />

      {currentPage === "announcements" && (
        <>
          <AcademyTabs
            selectedAcademy={selectedAcademy}
            onSelectAcademy={setSelectedAcademy}
          />
          <div className="flex-1 overflow-auto">
            <AnnouncementBoard academyId={selectedAcademy} />
          </div>
        </>
      )}

      {currentPage === "notifications" && (
        <div className="flex-1 overflow-auto">
          <NotificationPage />
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