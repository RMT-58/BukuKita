import { Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import BookCard from "../components/BookCard";
import MyBookCard from "../components/MyBookCard";

// GraphQL query for fetching user's books
const GET_MY_BOOKS = gql`
  query MyBooks {
    myBooks {
      _id
      title
      author
      genres
      synopsis
      cover_type
      condition
      condition_details
      thumbnail_url
      image_urls
      status
      price
      uploaded_by
      created_at
      updated_at
    }
  }
`;

const mockRentedBooks = [
  {
    id: "1",
    book: {
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
    expiresAt: "2024-12-31",
    status: "active",
  },
  {
    id: "2",
    book: {
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
    expiresAt: "2024-06-25",
    status: "active",
  },
  {
    id: "3",
    book: {
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
    expiresAt: "2023-12-15",
    status: "active",
  },
  {
    id: "4",
    book: {
      id: "4",
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
    expiresAt: "2025-12-15",
    status: "active",
  },
];

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const { loading, error, data, refetch } = useQuery(GET_MY_BOOKS, {
    skip: activeTab !== "mybooks",
  });

  useEffect(() => {
    if (activeTab === "mybooks") {
      refetch();
    }
  }, [activeTab, refetch]);

  const currentDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const filteredBooks = useMemo(() => {
    if (activeTab === "mybooks") {
      // Handle the case when data is loading or there's an error
      if (loading || error || !data || !data.myBooks) {
        return [];
      }

      // Filter myBooks based on search query
      return data.myBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // For active and history tabs, filter rented books
    return mockRentedBooks.filter((rental) => {
      const isMatchingSearch =
        rental.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.book.author.toLowerCase().includes(searchQuery.toLowerCase());

      // Determine book status based on expiration
      const expirationDate = new Date(rental.expiresAt);

      if (activeTab === "active") {
        // Active tab shows books not yet expired
        return isMatchingSearch && expirationDate > currentDate;
      } else if (activeTab === "history") {
        // History tab shows expired books
        return isMatchingSearch && expirationDate <= currentDate;
      }
      return false;
    });
  }, [searchQuery, activeTab, currentDate, data, loading, error]);

  return (
    <div className="pb-20 md:pb-0 bg-gray-50 min-h-screen">
      <header className="bg-white p-4 border-b md:hidden">
        <h1 className="text-xl font-bold">Library</h1>
      </header>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        {/* tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 ${
              activeTab === "active"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } first:rounded-l-md`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 ${
              activeTab === "history"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("mybooks")}
            className={`flex-1 py-2 ${
              activeTab === "mybooks"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } last:rounded-r-md`}
          >
            My Books
          </button>
        </div>

        {/* Loading state */}
        {activeTab === "mybooks" && loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading your books...</p>
          </div>
        ) : activeTab === "mybooks" && error ? (
          <div className="text-center py-8">
            <p className="text-red-500">
              Error loading your books. Please try again.
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === "active"
                ? "No active rentals"
                : activeTab === "history"
                  ? "No rental history found"
                  : "You haven't uploaded any books yet"}
            </p>
            {activeTab === "mybooks" && (
              <button
                onClick={() => (window.location.href = "/add-book")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((item) => {
              if (activeTab === "mybooks") {
                return <MyBookCard key={item._id} book={item} />;
              } else {
                return (
                  <BookCard
                    key={item.book.id}
                    book={item.book}
                    isHome={false}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
