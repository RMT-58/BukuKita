import { Star } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const BookCard = ({ book }) => {
  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex">
          {/* Book Cover */}
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={book.coverImage || "/placeholder.svg"}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="ml-4 flex-1">
            {/* Book Title and Distance */}
            <div className="flex justify-between items-start">
              <Link
                to={`/book/${book.id}`}
                className="text-[#00A8FF] font-medium hover:underline"
              >
                {book.title}
              </Link>
              <div className="text-gray-500 text-sm">{book.distance}</div>
            </div>

            {/* Book Details */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">{book.author}</p>
                <p className="text-sm font-medium mt-1">{book.format}</p>
                <p className="text-sm">Condition: {book.condition}</p>
                <Link
                  href="#"
                  className="text-[#00A8FF] text-xs hover:underline"
                >
                  View further explanation
                </Link>
              </div>

              {/* Owner and Rating */}
              <div className="text-right">
                <p className="text-sm">{book.owner}</p>
                <div className="flex text-yellow-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={
                        i < Math.floor(book.rating) ? "currentColor" : "none"
                      }
                      className={
                        i < Math.floor(book.rating) ? "" : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* View Photos */}
            <div className="mt-2">
              <Link href="#" className="text-[#00A8FF] text-xs hover:underline">
                View photos
              </Link>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mt-2">
              {book.categories.map((category, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {category}
                </span>
              ))}
              {book.categories.length > 0 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +1
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Availability and Rent Details */}
        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Available for</p>
              <p className="text-sm">{book.availablePeriod}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">For rent</p>
              <p className="text-sm font-medium">
                {book.currency} {book.price.toLocaleString()} per day
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex mt-3 gap-2">
            <button className="w-12 h-12 border border-[#00A8FF] text-[#00A8FF] rounded flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z"
                  stroke="#00A8FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Link
              href={`/rent/${book.id}`}
              className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
            >
              Rent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
