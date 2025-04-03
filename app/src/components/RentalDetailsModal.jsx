import { X } from "lucide-react";
import { Link } from "react-router";

const RentalDetailsModal = ({ rental, isOpen, onClose, formatDate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="text-lg font-bold">Rental Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">
                #{rental._id.substring(rental._id.length - 6)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(rental.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`font-medium ${
                  rental.status === "completed"
                    ? "text-green-600"
                    : rental.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium capitalize">
                {rental.payment_method.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Rented Books</h3>
            <div className="border rounded-lg divide-y">
              {rental.details &&
                rental.details.map((detail) => (
                  <div key={detail._id} className="p-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {detail.thumbnail_url && (
                          <img
                            src={detail.thumbnail_url || "/placeholder.svg"}
                            alt={detail.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link to={`/book/${detail._id}`}>
                          <h4 className="font-medium hover:text-primary">
                            {detail.title}
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-600">{detail.author}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {detail.genres &&
                            detail.genres.map((genre, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                              >
                                {genre}
                              </span>
                            ))}
                        </div>
                        <div className="mt-2 text-sm">
                          <div className="flex justify-between">
                            <span>Rental Period:</span>
                            <span>{detail.period} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Start Date:</span>
                            <span>{formatDate(detail.rental_start)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>End Date:</span>
                            <span>{formatDate(detail.rental_end)}</span>
                          </div>
                          <div className="flex justify-between font-medium mt-1">
                            <span>Price:</span>
                            <span>Rp {detail.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Amount:</span>
              <span>Rp {rental.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetailsModal;
