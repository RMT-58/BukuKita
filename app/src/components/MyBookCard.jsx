import { Star } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router";
import { formatCreatedAtDate, formatUnixTimestamp } from "../utils/formatDate";

const MyBookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit-book/${book._id}`);
  };

  const rating = 4;

  const genres = Array.isArray(book.genres) ? book.genres : [];

  console.log(book.created_at);

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex">
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={book.thumbnail_url || "/placeholder.svg"}
              alt={book.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <Link
                to={`/book/${book._id}`}
                className="text-blue-500 font-medium hover:underline"
              >
                {book.title}
              </Link>
              <div className="text-gray-500 text-sm">
                {formatUnixTimestamp(book.created_at)}
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">{book.author}</p>
                <p className="text-sm font-medium mt-1">{book.cover_type}</p>
                <p className="text-sm">Condition: {book.condition}/10</p>
                {book.condition_details && (
                  <div className="text-blue-500 text-xs hover:underline">
                    {book.condition_details}
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{book.status}</p>
                <div className="flex text-yellow-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(rating) ? "currentColor" : "none"}
                      className={i < Math.floor(rating) ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2">
              {book.image_urls && book.image_urls.length > 0 && (
                <Link
                  to={`/book/${book._id}/photos`}
                  className="text-blue-500 text-xs hover:underline"
                >
                  View photos ({book.image_urls.length})
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {genre}
                </span>
              ))}
              {genres.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{genres.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Uploaded on</p>
              <p className="text-sm">{formatUnixTimestamp(book.created_at)}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-sm font-medium">
                Rp. {book.price ? book.price.toLocaleString() : "0"} per day
              </p>
            </div>
          </div>

          <div className="flex mt-3 gap-2">
            <button
              onClick={handleEdit}
              className="w-12 h-12 border border-blue-500 text-blue-500 rounded flex items-center justify-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <Link
              to={`/book/${book._id}`}
              className="flex-1 bg-blue-500 text-white rounded flex items-center justify-center py-2"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookCard;
