import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { appStore } from "./app/store";
import { Toaster } from "sonner";
import { useLoadUserQuery } from "./features/api/authApi";
import NotificationsDropdown from "./components/NotificationsDropdown";
import NotificationProvider from "./components/NotificationProvider";

const CustomLoader = ({ children }) => {
const {isLoading}=useLoadUserQuery();

  return <>
  {/* Loader until the data loads */}
  {isLoading ? (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  ) : (
    children
  )}
  </>;

};
createRoot(document.getElementById("root")).render(
  <StrictMode>
  
    <Provider store={appStore}>
         <NotificationProvider>
      <CustomLoader>
      <App />
      <Toaster></Toaster>
      </CustomLoader>
      </NotificationProvider>
    </Provider>

  </StrictMode>
);
