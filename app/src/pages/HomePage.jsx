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
        </div>
      </div>

      <div className="p-4">
        {mockBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
