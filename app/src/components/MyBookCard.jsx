import {
  Edit,
  ExternalLink,
  Image,
  Trash2,
  AlertCircle,
  Check,
  Clock,
  Book,
  Settings,
  Ban,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { formatUnixTimestamp } from "../utils/formatDate";
import BookPhotosModal from "./BookPhotosModal";
import { toast, Toaster } from "react-hot-toast";

const MyBookCard = ({
  book,
  onUpdateStatus,
  onDeleteStatus,
  onDeleteSuccess,
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    navigate(`/edit-book/${book._id}`);
  };

  const handleToggleStatus = async () => {
    try {
      if (book.status === "rented") {
        toast.error("Cannot update status. Book is already rented.");
        return;
      }
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
      toast.success(
        `Book is now ${newStatus === "forRent" ? "available" : "unavailable"} for rent`
      );
    } catch (error) {
      console.error("Failed to update book status:", error);
      toast.error("Failed to update book status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDeleteStatus({
        variables: {
          deleteBookId: book._id,
        },
      });
      toast.success("Book deleted successfully");
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Failed to delete book:", error);
      toast.error("Failed to delete book");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const openPhotoModal = (e) => {
    e.preventDefault();
    setIsPhotoModalOpen(true);
  };

  const genres = Array.isArray(book.genres) ? book.genres : [];
  const photos = Array.isArray(book.image_urls) ? book.image_urls : [];

  const getStatusDetails = () => {
    if (book.status === "forRent") {
      return {
        icon: <Check size={16} className="text-green-500" />,
        text: "Available for rent",
        color: "text-green-500",
      };
    } else if (book.status === "rented") {
      return {
        icon: <Ban size={16} className="text-red-500" />,
        text: "Currently rented",
        color: "text-red-500",
      };
    } else {
      return {
        icon: <Ban size={16} className="text-red-500" />,
        text: "Closed by owner",
        color: "text-red-500",
      };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <>
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
                  className="text-[#00A8FF] font-medium hover:underline"
                >
                  {book.title}
                </Link>
                <div className="text-gray-500 text-sm flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatUnixTimestamp(book.created_at)}
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    {book.author}
                  </p>
                  <p className="text-sm font-medium mt-1 flex items-center">
                    <Book size={16} className="mr-1 text-gray-500" />
                    {book.cover_type}
                  </p>
                  <p className="text-sm flex items-center">
                    <Settings size={16} className="mr-1 text-gray-500" />
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
                  <p className="text-sm flex items-center justify-end">
                    <svg
                      className="w-4 h-4 mr-1 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {book.uploaded_by.username}
                  </p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span
                      className={`text-sm font-medium flex items-center ${
                        book.status === "forRent"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {statusDetails.icon}
                      <span className="ml-1">
                        {book.status === "forRent"
                          ? "Available"
                          : book.status === "isClosed"
                            ? "Not Available"
                            : "Currently Rented"}
                      </span>
                    </span>
                    <button
                      onClick={handleToggleStatus}
                      disabled={isUpdating}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:ring-offset-1 ${
                        book.status === "forRent"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Toggle availability to ${
                        book.status === "forRent"
                          ? "not available"
                          : "available"
                      }`}
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
              </div>

              {photos.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={openPhotoModal}
                    className="text-[#00A8FF] text-xs hover:underline flex items-center"
                  >
                    <Image size={16} className="mr-1" />
                    View photos ({photos.length})
                  </button>
                </div>
              )}

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {genres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      {genre}
                    </span>
                  ))}
                  {genres.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      +{genres.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`text-sm capitalize flex items-center ${statusDetails.color}`}
                >
                  {statusDetails.icon}
                  <span className="ml-1">{statusDetails.text}</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">For rent</p>
                <p className="text-sm font-medium flex items-center justify-end">
                  Rp. {book.price ? book.price.toLocaleString() : "0"} per week
                </p>
              </div>
            </div>

            <div className="flex mt-3 gap-2">
              <button
                onClick={handleEdit}
                disabled={book.status === "rented"}
                className={`w-12 h-12 border ${
                  book.status === "rented"
                    ? "border-gray-400 text-gray-400 cursor-not-allowed"
                    : "border-[#00A8FF] text-[#00A8FF] hover:bg-[#f0f9ff]"
                } rounded flex items-center justify-center transition-colors duration-200`}
                aria-label={
                  book.status === "rented"
                    ? "Cannot edit while rented"
                    : "Edit book"
                }
                title={
                  book.status === "rented"
                    ? "Cannot edit while rented"
                    : "Edit book"
                }
              >
                <Edit size={18} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-12 h-12 border border-red-500 text-red-500 rounded flex items-center justify-center hover:bg-red-50 transition-colors duration-200"
                aria-label="Delete book"
                title="Delete book"
                disabled={isDeleting}
              >
                <Trash2 size={18} className={isDeleting ? "opacity-50" : ""} />
              </button>

              <Link
                to={`/book/${book._id}`}
                className="flex-1 bg-[#00A8FF] hover:bg-[#0098e5] text-white rounded flex items-center justify-center gap-2 py-2 transition-colors duration-200"
              >
                <Book size={18} />
                <span className="font-medium">View Details</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-2" />
              Delete Book
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{book.title}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BookPhotosModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photos={photos}
      />
    </>
  );
};

export default MyBookCard;
