import React, { createContext } from "react";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
} from "@/features/api/notificationApi";
import { useLoadUserQuery } from "@/features/api/authApi";

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markAllAsRead: () => {},
});

const NotificationProvider = ({ children }) => {
  // Check if user is authenticated
  const token = localStorage.getItem("token");
  const { data: userData } = useLoadUserQuery(undefined, {
    skip: !token,
  });
  
  const userId = userData?.user?._id;

  // Only fetch notifications if user is logged in
const { data, isLoading } = useGetNotificationsQuery(userId, {
  skip: !userId,
});




  const [markAllAsReadMutation] = useMarkAllAsReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markAllAsRead = async () => {
    if (!userId) return; // Guard clause
    
    try {
      await markAllAsReadMutation().unwrap();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;