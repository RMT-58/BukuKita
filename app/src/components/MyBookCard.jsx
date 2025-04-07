import { Edit, ExternalLink, Image, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { formatUnixTimestamp } from "../utils/formatDate";
import BookPhotosModal from "./BookPhotosModal";

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
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Failed to delete book:", error);
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
                <div className="text-gray-500 text-sm">
                  {formatUnixTimestamp(book.created_at)}
                </div>
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
                  <p className="text-sm">{book.uploaded_by.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">
                      <span
                        className={`${
                          book.status === "forRent"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {book.status === "forRent"
                          ? "Available"
                          : "Not Available"}
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
                    <Image size={14} className="mr-1" />
                    View photos ({photos.length})
                  </button>
                </div>
              )}

              {genres.length > 0 && (
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
              )}
            </div>
          </div>

          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm">
                  {book.status === "forRent"
                    ? "Available for rent"
                    : "Not available"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">For rent</p>
                <p className="text-sm font-medium">
                  Rp. {book.price ? book.price.toLocaleString() : "0"} per week
                </p>
              </div>
            </div>

            <div className="flex mt-3 gap-2">
              <button
                onClick={handleEdit}
                className="w-12 h-12 border border-[#00A8FF] text-[#00A8FF] rounded flex items-center justify-center"
                aria-label="Edit book"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={handleDeleteClick}
                className="w-12 h-12 border border-red-500 text-red-500 rounded flex items-center justify-center"
                aria-label="Delete book"
                disabled={isDeleting}
              >
                <Trash2 size={18} className={isDeleting ? "opacity-50" : ""} />
              </button>

              <Link
                to={`/book/${book._id}`}
                className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
              >
                <span className="font-medium">View Details</span>
                <ExternalLink size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 w-full">
            <h3 className="text-lg font-medium mb-4">Delete Book</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{book.title}"? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
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
