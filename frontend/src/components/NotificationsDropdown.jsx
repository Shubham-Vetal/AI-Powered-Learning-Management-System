import React, { useEffect, useState, useCallback, createContext } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";

export const NotificationContext = createContext({ addNotification: () => {} });

const NotificationsDropdown = ({ children }) => {
  const { data } = useGetPurchasedCoursesQuery();
  const purchasedCourses = data?.purchasedCourse || [];

  const [notifications, setNotifications] = useState([]);
  const [seenCourseIds, setSeenCourseIds] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedSeen = JSON.parse(localStorage.getItem("seenCourseIds") || "[]");
    setSeenCourseIds(new Set(storedSeen));
  }, []);

useEffect(() => {
  if (!purchasedCourses.length) return;

  const newCourses = purchasedCourses.filter(
    (course) => !seenCourseIds.has(course._id)
  );

  if (newCourses.length > 0) {
    const newNotifications = newCourses.map((course) => ({
      id: Date.now() + Math.random(),
      text: `You successfully purchased "${course.courseId.courseTitle}"`,
      time: "Just now",
    }));
    setNotifications((prev) => [...newNotifications, ...prev]);
    setUnreadCount((prev) => prev + newNotifications.length);

    const updatedIds = new Set(seenCourseIds);
    newCourses.forEach((c) => updatedIds.add(c._id));
    localStorage.setItem("seenCourseIds", JSON.stringify([...updatedIds]));
    setSeenCourseIds(updatedIds);
  }
  // Convert Set to stable dependency by stringifying it
}, [purchasedCourses, JSON.stringify([...seenCourseIds])]);


  const addNotification = useCallback(({ text, time = "Just now" }) => {
    const newNotification = { id: Date.now() + Math.random(), text, time };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 shadow-xl border-gray-200 dark:border-gray-800">
          <DropdownMenuLabel className="flex justify-between items-center">
            Notifications
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-medium">{n.text}</p>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationsDropdown;
