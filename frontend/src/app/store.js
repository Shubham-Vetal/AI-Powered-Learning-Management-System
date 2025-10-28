import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/features/api/authApi";
import rootReducer from "./rootReducer";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { chatbotApi } from "@/features/api/chatbotApi";
import { notificationApi } from "@/features/api/notificationApi";
export const appStore = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware) =>
    defaultMiddleware().concat(
      authApi.middleware,
      courseApi.middleware,
      purchaseApi.middleware,
      courseProgressApi.middleware,
      chatbotApi.middleware,
      notificationApi.middleware,
    ),
});

const initializeApp = async () => {
  await appStore.dispatch(
    authApi.endpoints.loadUser.initiate({}, { forceRefetch: true })
  );
};
initializeApp();
