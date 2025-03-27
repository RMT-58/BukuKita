import React from "react";
import { Link, useLocation } from "react-router";
import {
  BookOpen,
  Home,
  MessageSquare,
  Play,
  PlusCircle,
  User,
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
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
          <PlusCircle size={20} />
          <span className="text-xs mt-1">Add Book</span>
        </Link>

        <Link
          to="/chats"
          className={`flex flex-col items-center ${isActiveRoute("/chats") ? "text-[#00A8FF]" : "text-gray-500"}`}
        >
          <MessageSquare size={20} />
          <span className="text-xs mt-1">Chats</span>
        </Link>

        <Link
          to="/player"
          className={`flex flex-col items-center ${isActiveRoute("/player") ? "text-[#00A8FF]" : "text-gray-500"}`}
        >
          <Play size={20} />
          <span className="text-xs mt-1">Player</span>
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
  );
};

export default Navbar;
