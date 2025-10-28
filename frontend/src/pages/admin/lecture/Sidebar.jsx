import { ChartNoAxesColumn, SquareLibrary } from "lucide-react";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <div className="hidden lg:flex flex-col fixed left-0 top-18 h-screen w-[250px] sm:w-[300px] border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0d0d0d] p-5 space-y-8">
        <div className="space-y-4">
          <Link
            to="dashboard"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ChartNoAxesColumn size={22} />
            <h1 className="font-medium">Dashboard</h1>
          </Link>
          <Link
            to="course"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <SquareLibrary size={22} />
            <h1 className="font-medium">Courses</h1>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[280px] sm:ml-[300px] p-6 md:p-10 mt-2 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
