import React from "react";
import { Link, useLocation } from "react-router";
import { Library, Play, Plus, Search, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around items-center">
        <Link
          to={"/"}
          className={`flex flex-col items-center ${isActiveRoute("/") ? "text-blue-500" : "text-gray-500"}`}
        >
          <Search size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to={"/library"}
          className={`flex flex-col items-center ${isActiveRoute("/library") ? "text-blue-500" : "text-gray-500"}`}
        >
          <Library size={20} />
          <span className="text-xs mt-1">Library</span>
        </Link>
        <Link
          to={"/add-book"}
          className={`flex flex-col items-center rounded-full p-2 ${
            isActiveRoute("/add-book")
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-500"
          } transition-all duration-300`}
        >
          <Plus size={24} />
        </Link>
        <Link
          to={"/player"}
          className={`flex flex-col items-center ${isActiveRoute("/player") ? "text-blue-500" : "text-gray-500"}`}
        >
          <Play size={20} />
          <span className="text-xs mt-1">Player</span>
        </Link>
        <Link
          to={"/profile"}
          className={`flex flex-col items-center ${isActiveRoute("/profile") ? "text-blue-500" : "text-gray-500"}`}
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
