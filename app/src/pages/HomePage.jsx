import { Bell, MessageSquare, Plus, Search, Star, User } from "lucide-react";
import React, { useState } from "react";
import BookCard from "../components/BookCard";
import { Link } from "react-router";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a book title or author"
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Link
            to={"/chats"}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <div className="relative">
              <MessageSquare size={20} className="text-gray-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <BookCard />
        <BookCard />
        <BookCard />
      </div>
    </div>
  );
};

export default HomePage;
