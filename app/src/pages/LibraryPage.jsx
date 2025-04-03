"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import MyBookCard from "../components/MyBookCard";
import RentalCard from "../components/RentalCard";

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

const GET_MY_RENTALS = gql`
  query MyRentals {
    myRentals {
      _id
      user_id
      total_amount
      status
      payment_method
      paid_date
      created_at
      updated_at
      details {
        _id
        book_id
        price
        period
        total
        title
        author
        genres
        synopsis
        cover_type
        thumbnail_url
        image_urls
        rental_id
        rental_start
        rental_end
        created_at
        updated_at
      }
    }
  }
`;

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const {
    loading: loadingBooks,
    error: errorBooks,
    data: booksData,
    refetch: refetchBooks,
  } = useQuery(GET_MY_BOOKS, {
    skip: activeTab !== "mybooks",
  });

  const {
    loading: loadingRentals,
    error: errorRentals,
    data: rentalsData,
    refetch: refetchRentals,
  } = useQuery(GET_MY_RENTALS, {
    skip: activeTab === "mybooks",
  });

  useEffect(() => {
    if (activeTab === "mybooks") {
      refetchBooks();
    } else {
      refetchRentals();
    }
  }, [activeTab, refetchBooks, refetchRentals]);

  const currentDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const filteredRentals = useMemo(() => {
    if (
      loadingRentals ||
      errorRentals ||
      !rentalsData ||
      !rentalsData.myRentals
    ) {
      return [];
    }

    return rentalsData.myRentals.filter((rental) => {
      // Filter by tab
      if (activeTab === "pending" && rental.status !== "pending") {
        return false;
      }

      if (activeTab !== "pending" && rental.status === "pending") {
        return false;
      }

      // For active and history tabs, check rental dates
      if (
        activeTab !== "pending" &&
        rental.details &&
        rental.details.length > 0
      ) {
        const isExpired = rental.details.some((detail) => {
          const rentalEndDate = Number(detail.rental_end);
          return new Date(rentalEndDate) <= currentDate;
        });

        if (
          (activeTab === "active" && isExpired) ||
          (activeTab === "history" && !isExpired)
        ) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery && rental.details && rental.details.length > 0) {
        return rental.details.some(
          (detail) =>
            detail.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            detail.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return true;
    });
  }, [
    activeTab,
    currentDate,
    loadingRentals,
    errorRentals,
    rentalsData,
    searchQuery,
  ]);

  const filteredBooks = useMemo(() => {
    if (activeTab === "mybooks") {
      if (loadingBooks || errorBooks || !booksData || !booksData.myBooks) {
        return [];
      }

      return booksData.myBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [];
  }, [activeTab, booksData, errorBooks, loadingBooks, searchQuery]);

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

        <div className="flex mb-6 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "active"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border-x border-gray-200`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "history"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border-r border-gray-200`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("mybooks")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "mybooks"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            My Books
          </button>
        </div>

        {(activeTab === "mybooks" && loadingBooks) ||
        (activeTab !== "mybooks" && loadingRentals) ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (activeTab === "mybooks" && errorBooks) ||
          (activeTab !== "mybooks" && errorRentals) ? (
          <div className="text-center py-8">
            <p className="text-red-500">
              Error loading data. Please try again.
            </p>
          </div>
        ) : (activeTab === "mybooks" && filteredBooks.length === 0) ||
          (activeTab !== "mybooks" && filteredRentals.length === 0) ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === "active"
                ? "No active rentals"
                : activeTab === "pending"
                  ? "No pending rentals"
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
            {activeTab === "mybooks"
              ? filteredBooks.map((book) => (
                  <MyBookCard key={book._id} book={book} />
                ))
              : filteredRentals.map((rental) => (
                  <div key={rental._id}>
                    {rental.details && rental.details.length > 0 ? (
                      // If rental has details, render a card for each detail
                      rental.details.map((detail) => (
                        <RentalCard
                          key={detail._id}
                          rental={rental}
                          detail={detail}
                        />
                      ))
                    ) : (
                      // If rental has no details, render a single card
                      <RentalCard
                        key={rental._id}
                        rental={rental}
                        detail={null}
                      />
                    )}
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
