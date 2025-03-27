import React from "react";
import { Link, useLocation } from "react-router";
import {
  BookOpen,
  Home,
  Library,
  MessageSquare,
  Play,
  Plus,
  PlusCircle,
  Search,
  User,
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden z-10">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className={`flex flex-col items-center ${isActiveRoute("/") ? "text-[#00A8FF]" : "text-gray-500"}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/library"
            className={`flex flex-col items-center ${isActiveRoute("/library") ? "text-[#00A8FF]" : "text-gray-500"}`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Library</span>
          </Link>

          <Link
            to="/add-book"
            className={`flex flex-col items-center ${isActiveRoute("/add-book") ? "text-[#00A8FF]" : "text-gray-500"}`}
          >
            <div className="bg-[#00A8FF] rounded-full w-12 h-12 flex items-center justify-center text-white">
              <PlusCircle size={24} />
            </div>
          </Link>

          <Link
            to="/chats"
            className={`flex flex-col items-center ${isActiveRoute("/chats") ? "text-[#00A8FF]" : "text-gray-500"}`}
          >
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Chats</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center ${isActiveRoute("/profile") ? "text-[#00A8FF]" : "text-gray-500"}`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Desktop Top Navigation */}
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-3 px-6 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/"
            className="text-xl font-bold text-[#00A8FF] flex items-center"
          >
            <div className="w-8 h-8 bg-[#00A8FF] rounded-full flex items-center justify-center mr-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 2H18C19.1 2 20 2.9 20 4V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6V18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 9L12 6L15 9"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            BukuKita
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`${isActiveRoute("/") ? "text-[#00A8FF]" : "text-gray-700"} font-medium`}
            >
              Home
            </Link>
            <Link
              to="/library"
              className={`${isActiveRoute("/library") ? "text-[#00A8FF]" : "text-gray-700"} font-medium`}
            >
              Library
            </Link>
            <Link
              to="/add-book"
              className={`${isActiveRoute("/add-book") ? "text-[#00A8FF]" : "text-gray-700"} font-medium`}
            >
              Add a Book
            </Link>
            <Link
              to="/chats"
              className={`${isActiveRoute("/chats") ? "text-[#00A8FF]" : "text-gray-700"} font-medium`}
            >
              Chats
            </Link>
            <Link
              to="/profile"
              className={`${isActiveRoute("/profile") ? "text-[#00A8FF]" : "text-gray-700"} font-medium`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for desktop top navigation */}
      <div className="hidden md:block h-16"></div>
    </>
  );
};

export default Navbar;
