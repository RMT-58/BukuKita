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
  ShoppingCart,
  User,
} from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const cartCount = 1;

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* ketika di mobile dia di bawah seperti navigasi */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 sm:hidden z-10">
        <div className="flex justify-around items-center">
          <Link
            to="/"
            className={`flex flex-col items-center ${isActiveRoute("/") ? "text-primary" : "text-gray-500"}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/library"
            className={`flex flex-col items-center ${isActiveRoute("/library") ? "text-primary" : "text-gray-500"}`}
          >
            <BookOpen size={20} />
            <span className="text-xs mt-1">Library</span>
          </Link>

          <Link
            to="/add-book"
            className={`flex flex-col items-center ${
              isActiveRoute("/add-book") ? "text-primary" : "text-gray-500"
            }`}
          >
            <div
              className={`relative rounded-full w-12 h-12 flex items-center justify-center text-white bg-primary ${
                isActiveRoute("/add-book")
                  ? "ring-2 ring-blue-500 transition-all duration-200"
                  : ""
              }`}
            >
              <PlusCircle size={24} />
            </div>
          </Link>

          <Link
            to="/chats"
            className={`flex flex-col items-center ${isActiveRoute("/chats") ? "text-primary" : "text-gray-500"}`}
          >
            <MessageSquare size={20} />
            <span className="text-xs mt-1">Chats</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center ${isActiveRoute("/profile") ? "text-primary" : "text-gray-500"}`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* ketika di desktop dia diatas */}
      <div className="hidden sm:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-3 px-6 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/"
            className="text-xl font-bold text-primary flex items-center"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
              <img src={logo} alt="Logo" className="w-6 h-6" />
            </div>
            BukuKita
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`${isActiveRoute("/") ? "text-primary" : "text-gray-700"} font-medium`}
            >
              Home
            </Link>
            <Link
              to="/library"
              className={`${isActiveRoute("/library") ? "text-primary" : "text-gray-700"} font-medium`}
            >
              Library
            </Link>
            <Link
              to="/add-book"
              className={`${isActiveRoute("/add-book") ? "text-primary" : "text-gray-700"} font-medium`}
            >
              Add a Book
            </Link>
            <Link
              to="/chats"
              className={`${isActiveRoute("/chats") ? "text-primary" : "text-gray-700"} font-medium`}
            >
              Chats
            </Link>
            <Link
              to="/profile"
              className={`${isActiveRoute("/profile") ? "text-primary" : "text-gray-700"} font-medium`}
            >
              Profile
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart
                className={` text-xl ${isActiveRoute("/cart") ? "text-primary" : "text-gray-700"}`}
              />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block h-16"></div>
    </>
  );
};

export default Navbar;
