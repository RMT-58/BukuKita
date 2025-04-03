"use client";
import { Link, useNavigate } from "react-router";
import { formatUnixTimestamp } from "../utils/formatDate";

const RentalCard = ({ rental, detail, isHome = false }) => {
  const navigate = useNavigate();

  const formatRentalStatus = (status) => {
    switch (status) {
      case "pending":
        return "Pending Payment";
      case "paid":
        return "Paid";
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "failed":
        return "Failed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const isRentalExpired = () => {
    if (!detail || !detail.rental_end) return false;
    const expiryDate = new Date(Number(detail.rental_end));
    const currentDate = new Date();
    return expiryDate < currentDate;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "paid":
      case "active":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const bookInfo = detail || {
    title: "Pending Rental",
    author: "No details available",
    thumbnail_url: "/placeholder.svg?height=200&width=150",
    cover_type: "N/A",
    genres: [],
    period: 0,
    price: 0,
    total: 0,
    rental_start: null,
    rental_end: null,
  };

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="p-4">
        <div
          className={`mb-3 px-3 py-1 rounded-md inline-block text-xs font-medium ${getStatusColor(rental.status)}`}
        >
          {formatRentalStatus(rental.status)}
          {isRentalExpired() &&
            !["cancelled", "completed"].includes(rental.status) && (
              <span className="ml-2 text-red-600">(Expired)</span>
            )}
        </div>

        <div className="flex">
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={bookInfo.thumbnail_url || "/placeholder.svg"}
              alt={bookInfo.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <Link
                to={`/book/${bookInfo.book_id || ""}`}
                className="text-[#00A8FF] font-medium hover:underline"
              >
                {bookInfo.title}
              </Link>
              <div className="text-gray-500 text-sm">
                {formatUnixTimestamp(rental.created_at)}
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">{bookInfo.author}</p>
                <p className="text-sm font-medium mt-1">
                  {bookInfo.cover_type}
                </p>

                <Link
                  href="#"
                  className="text-[#00A8FF] text-xs hover:underline"
                >
                  View further explanation
                </Link>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  Rp {bookInfo.total?.toLocaleString() || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: Rp {rental.total_amount?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-2">
              <Link href="#" className="text-[#00A8FF] text-xs hover:underline">
                View photos
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {bookInfo.genres &&
                bookInfo.genres.map((category, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {category}
                  </span>
                ))}
              {bookInfo.genres && bookInfo.genres.length > 0 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +1
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Rental period</p>
              <p className="text-sm">
                {bookInfo.period
                  ? `${bookInfo.period} month${bookInfo.period > 1 ? "s" : ""} (${formatUnixTimestamp(
                      bookInfo.rental_start
                    )} - ${formatUnixTimestamp(bookInfo.rental_end)})`
                  : "Pending confirmation"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Rental price</p>
              <p className="text-sm font-medium">
                Rp {bookInfo.price?.toLocaleString() || "0"} per month
              </p>
            </div>
          </div>

          <div className="flex mt-3 gap-2">
            <button
              onClick={() => navigate(`/chat/${bookInfo.book_id || ""}`)}
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
                onClick={() => console.log("handle add to cart")}
                className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
              >
                Rent
              </button>
            ) : (
              <Link
                to={`/rental/${rental._id}`}
                className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
              >
                Rental Details
              </Link>
            )}
          </div>

          {rental.status === "pending" && (
            <div className="mt-3">
              <button
                onClick={() => navigate(`/payment/${rental._id}`)}
                disabled={isRentalExpired()} 
                className={`w-full rounded flex items-center justify-center py-2 
                ${
                  isRentalExpired()
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" // Disabled style
                    : "bg-green-500 text-white" 
                }`}
              >
                {isRentalExpired() ? "Expired" : "Complete Payment"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalCard;
