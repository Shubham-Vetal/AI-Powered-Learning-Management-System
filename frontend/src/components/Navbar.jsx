import { Menu, School, User, BookOpen, LogOut, Settings, Bell, GraduationCap, Home } from "lucide-react";
import React, { useEffect, useState } from "react";
import NotificationsDropdown from "./NotificationsDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const location = useLocation();


  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "User logged out.");
      navigate("/login");
    }
  }, [isSuccess]);



  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      isActive 
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" 
        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
    }`;
  };

  return (
    <div className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50 shadow-sm">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all">
            E-Learning
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link className={navLinkClass("/")} to="/">
              <div className="flex items-center gap-2">
                <Home size={18} />
                <span>Home</span>
              </div>
            </Link>
          </div>

        
 {/* Dynamic Notifications */}
{user && <NotificationsDropdown />}



          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                      <AvatarImage src={user?.photoUrl || ""} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                      {user?.name?.split(' ')[0] || "User"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200 dark:border-gray-800">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <BookOpen className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Link to="my-learning" className="flex-1">My Learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <User className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Link to="profile" className="flex-1">Edit Profile</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Settings className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <Link to="/admin/dashboard" className="flex-1">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logoutHandler} className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                Sign up
              </Button>
            </div>
          )}

          {/* Dark Mode */}
          <DarkMode />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            E-Learning
          </h1>
        </Link>
        <MobileNavbar user={user} logoutHandler={logoutHandler} />
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({ user, logoutHandler }) => {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          size="icon" 
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-80">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <GraduationCap size={20} className="text-white" />
            </div>
            <Link to="/" className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              E-Learning
            </Link>
          </SheetTitle>
          <DarkMode />
        </SheetHeader>
        <Separator className="my-4" />
        
        {user ? (
          <>
            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-500/20">
                <AvatarImage src={user?.photoUrl || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <nav className="flex flex-col space-y-1">
              <SheetClose asChild>
                <Link 
                  to="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Home
                  </span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link 
                  to="/my-learning"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    My Learning
                  </span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Profile
                  </span>
                </Link>
              </SheetClose>

              {user?.role === "instructor" && (
                <>
                  <Separator className="my-2" />
                  <SheetClose asChild>
                    <Link 
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        Dashboard
                      </span>
                    </Link>
                  </SheetClose>
                </>
              )}

              <Separator className="my-2" />
              
              <button 
                onClick={logoutHandler}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group w-full text-left"
              >
                <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                  Log out
                </span>
              </button>
            </nav>
          </>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")}
              className="w-full font-medium"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
            >
              Sign up
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};