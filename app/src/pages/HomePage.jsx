import { Bell, MessageSquare, Plus, Search, Star, User } from "lucide-react";
import React, { useState } from "react";
import BookCard from "../components/BookCard";
import { Link } from "react-router";

const mockBooks = [
  {
    id: "1",
    title: "Vision of the Anointed",
    author: "Thomas Sowell",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/en/d/d1/The_vision_of_the_annointed_bookcover.jpg",
    format: "Paperback",
    condition: "8.5/10",
    distance: "3km",
    owner: "Justin James",
    rating: 5,
    categories: ["Economics", "Non-fiction", "Politics"],
    availablePeriod: "1 year (12/04/2025 - 12/04/2026)",
    price: 5000,
    currency: "Rp",
  },
  {
    id: "2",
    title: "Vision of the Anointed",
    author: "Thomas Sowell",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/en/d/d1/The_vision_of_the_annointed_bookcover.jpg",
    format: "Hardcover",
    condition: "8.0/10",
    distance: "7.5km",
    owner: "Josh R.",
    rating: 5,
    categories: ["Economics", "Non-fiction", "Politics"],
    availablePeriod: "2 months (12/04/2025 - 12/06/2025)",
    price: 7000,
    currency: "Rp",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    coverImage: "https://cdn.gramedia.com/uploads/items/9780451524935.jpg",
    format: "Paperback",
    condition: "7.5/10",
    distance: "5km",
    owner: "Sarah M.",
    rating: 4.5,
    categories: ["Fiction", "Dystopian", "Classics"],
    availablePeriod: "3 months (12/04/2025 - 12/07/2025)",
    price: 4500,
    currency: "Rp",
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/id/8/8f/Pride_%26_Prejudice_Movie_Poster_2005.jpg",
    format: "Hardcover",
    condition: "9.0/10",
    distance: "2.3km",
    owner: "Emma W.",
    rating: 4.8,
    categories: ["Fiction", "Romance", "Classics"],
    availablePeriod: "6 months (12/04/2025 - 12/10/2025)",
    price: 6000,
    currency: "Rp",
  },
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { value: "all", label: "All", count: 7 },
    { value: "books", label: "Books", count: 4 },
    { value: "audiobooks", label: "Audio books", count: 2 },
  ];

  return (
    <div className="pb-20 md:pb-0 bg-gray-50 min-h-screen">
      <header className="bg-white border-b p-4 md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Home</h1>
        </div>
      </header>
      <div className="p-4 max-w-4xl mx-auto">
        {/* search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        {/* tabs */}
        <div className="flex overflow-x-auto space-x-2 mb-6 bg-gray-100 rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors duration-200
                ${
                  activeTab === tab.value
                    ? "bg-[#00A8FF] text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }
                flex items-center space-x-1
              `}
            >
              <span>{tab.label}</span>
              <span
                className={`
                rounded-full px-1.5 py-0.5 text-xs
                ${
                  activeTab === tab.value
                    ? "bg-white/30 text-white"
                    : "bg-gray-200 text-gray-700"
                }
              `}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {mockBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
