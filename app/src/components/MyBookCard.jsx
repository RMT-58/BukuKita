"use client";

import { Edit, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { formatUnixTimestamp } from "../utils/formatDate";

const MyBookCard = ({ book, onUpdateStatus }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    navigate(`/edit-book/${book._id}`);
  };

  const handleToggleStatus = async () => {
    try {
      setIsUpdating(true);
      const newStatus = book.status === "forRent" ? "isClosed" : "forRent";

      await onUpdateStatus({
        variables: {
          updateBookId: book._id,
          input: {
            status: newStatus,
          },
        },
      });
    } catch (error) {
      console.error("Failed to update book status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const genres = Array.isArray(book.genres) ? book.genres : [];

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Book Cover */}
          <div className="relative w-full sm:w-24 h-40 sm:h-36 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
            <img
              src={
                book.thumbnail_url || "/placeholder.svg?height=160&width=120"
              }
              alt={book.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Book Details */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <Link
                  to={`/book/${book._id}`}
                  className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {book.title}
                </Link>
                <p className="text-gray-600 mt-1">{book.author}</p>
              </div>
              <div className="text-gray-500 text-sm">
                {formatUnixTimestamp(book.created_at)}
              </div>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Cover:</span>
                  <span className="text-sm font-medium">{book.cover_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Condition:</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      {book.condition}/10
                    </span>
                    {book.condition_details && (
                      <span
                        className="ml-1 text-primary text-xs cursor-help hover:underline"
                        title={book.condition_details}
                      >
                        (details)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Uploader:</span>
                  <span className="text-sm font-medium">
                    {book.uploaded_by.username}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${book.status === "forRent" ? "text-green-600" : "text-red-600"}`}
                    >
                      {book.status === "forRent"
                        ? "Available"
                        : "Not Available"}
                    </span>
                    <button
                      onClick={handleToggleStatus}
                      disabled={isUpdating}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                        book.status === "forRent"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Toggle availability to ${book.status === "forRent" ? "not available" : "available"}`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          book.status === "forRent"
                            ? "translate-x-6"
                            : "translate-x-1"
                        } ${isUpdating ? "opacity-50" : ""}`}
                      />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    Rp. {book.price ? book.price.toLocaleString() : "0"}/day
                  </span>
                </div>
                {book.image_urls && book.image_urls.length > 0 && (
                  <Link
                    to={`/book/${book._id}/photos`}
                    className="text-primary text-xs hover:underline mt-1"
                  >
                    View all photos ({book.image_urls.length})
                  </Link>
                )}
              </div>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-primary text-xs px-2 py-0.5 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
                {genres.length > 3 && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    +{genres.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-primary text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              aria-label="Edit book"
            >
              <Edit size={16} />
              <span className="text-sm font-medium">Edit</span>
            </button>
            <Link
              to={`/book/${book._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white rounded-md py-2 hover:bg-blue-700 transition-colors"
            >
              <span className="font-medium">View Details</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookCard;
