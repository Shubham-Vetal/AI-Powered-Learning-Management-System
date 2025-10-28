import authReducer from "../features/authSlice";
import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { chatbotApi } from "@/features/api/chatbotApi";
import { notificationApi } from "@/features/api/notificationApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [courseProgressApi.reducerPath]:courseProgressApi.reducer,
  [chatbotApi.reducerPath]: chatbotApi.reducer,
  [notificationApi.reducerPath]:notificationApi.reducer,

  auth: authReducer,
});

export default rootReducer;
