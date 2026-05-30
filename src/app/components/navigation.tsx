import React from "react";
import { Calendar, Bell, BookOpen, Megaphone } from "lucide-react";

interface NavigationProps {
  currentPage: "home" | "announcements" | "calendar" | "notifications";
  onNavigate: (page: "home" | "announcements" | "calendar" | "notifications") => void;
  unreadNotificationCount?: number;
}

export function Navigation({ currentPage, onNavigate, unreadNotificationCount = 0 }: NavigationProps) {
  return (
    <nav className="w-full border-b bg-card">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="ml-2">아이플랜</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("announcements")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === "announcements"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Megaphone className="w-5 h-5" />
              <span>공지사항</span>
            </button>

            <button
              onClick={() => onNavigate("notifications")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                currentPage === "notifications"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>알림</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>캘린더</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
