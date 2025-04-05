import { Image, Star } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import BookPhotosModal from "./BookPhotosModal";

const BookCard = ({ book, isHome }) => {
  const handleAddToCart = () => {
    console.log("handle add to cart");
  };

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const navigate = useNavigate();

  const openPhotoModal = (e) => {
    e.preventDefault();
    setIsPhotoModalOpen(true);
  };

  const photos = Array.isArray(book.image_urls) ? book.image_urls : [];

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm mb-4">
      <div className="p-4">
        <div className="flex">
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={book.thumbnail_url || "/placeholder.svg"}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <Link
                to={`/book/${book._id}`}
                className="text-[#00A8FF] font-medium hover:underline"
              >
                {book.title}
              </Link>
              {book.uploaded_by && (
                <div className="text-gray-500 text-sm">
                  {book.uploaded_by.address}
                </div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">{book.author}</p>
                <p className="text-sm font-medium mt-1">{book.cover_type}</p>
                <p className="text-sm">
                  Condition: {book.condition}/10
                  {book.condition_details && (
                    <Link
                      to={`/book/${book._id}`}
                      className="ml-1 text-[#00A8FF] text-xs hover:underline"
                      title={book.condition_details}
                    >
                      View further explanation
                    </Link>
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm">{book.uploaded_by?.name || "Unknown"}</p>
                <div className="flex text-yellow-400 mt-1">
                  {[...Array(5)].map((_, i) => {
                    const rating = book.condition || 0;

                    let filledStars = 0;
                    if (rating <= 2) filledStars = 1;
                    else if (rating <= 4) filledStars = 2;
                    else if (rating <= 6) filledStars = 3;
                    else if (rating <= 8) filledStars = 4;
                    else filledStars = 5;

                    return (
                      <Star
                        key={i}
                        size={14}
                        fill={i < filledStars ? "currentColor" : "none"}
                        className={i < filledStars ? "" : "text-gray-300"}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={openPhotoModal}
                  className="text-[#00A8FF] text-xs hover:underline flex items-center"
                >
                  <Image size={14} className="mr-1" />
                  View photos ({photos.length})
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {book.genres &&
                book.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {genre}
                  </span>
                ))}
              {book.genres && book.genres.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{book.genres.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm capitalize">{book.status || "Available"}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">For rent</p>
              <p className="text-sm font-medium">
                Rp {book.price?.toLocaleString() || 0} per day
              </p>
            </div>
          </div>

          <div className="flex mt-3 gap-2">
            <button
              onClick={() => navigate(`/chat/${book._id}`)}
              className="w-12 h-12 border border-[#00A8FF] text-[#00A8FF] rounded flex items-center justify-center"
            >
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

            {isHome ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
              >
                Rent
              </button>
            ) : (
              <Link
                to={`/book/${book._id}`}
                className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>

      <BookPhotosModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photos={photos}
      />
    </div>
  );
};

export default BookCard;
