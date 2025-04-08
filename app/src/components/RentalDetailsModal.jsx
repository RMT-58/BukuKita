// import { X } from "lucide-react";
// import { Link } from "react-router";

// const RentalDetailsModal = ({ rental, isOpen, onClose, formatDate }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
//         <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
//           <h2 className="text-lg font-bold">Rental Details</h2>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-gray-100"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-4">
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <p className="text-sm text-gray-500">Order ID</p>
//               <p className="font-medium">
//                 #{rental._id.substring(rental._id.length - 6)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Date</p>
//               <p className="font-medium">{formatDate(rental.created_at)}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Status</p>
//               <p
//                 className={`font-medium ${
//                   rental.status === "completed"
//                     ? "text-green-600"
//                     : rental.status === "pending"
//                       ? "text-yellow-600"
//                       : "text-red-600"
//                 }`}
//               >
//                 {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Payment Method</p>
//               <p className="font-medium capitalize">
//                 {rental.payment_method
//                   ? rental.payment_method.replace(/_/g, " ")
//                   : "Not specified"}
//               </p>
//             </div>
//           </div>

//           <div className="mb-4">
//             <h3 className="font-medium mb-2">Rented Books</h3>
//             <div className="border rounded-lg divide-y">
//               {rental.details &&
//                 rental.details.map((detail) => (
//                   <div key={detail._id} className="p-3">
//                     <div className="flex gap-3">
//                       <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
//                         {detail.thumbnail_url && (
//                           <img
//                             src={detail.thumbnail_url || "/placeholder.svg"}
//                             alt={detail.title}
//                             className="w-full h-full object-cover"
//                           />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <Link to={`/book/${detail._id}`}>
//                           <h4 className="font-medium hover:text-primary">
//                             {detail.title}
//                           </h4>
//                         </Link>
//                         <p className="text-sm text-gray-600">{detail.author}</p>
//                         <div className="flex flex-wrap gap-1 mt-1">
//                           {detail.genres &&
//                             detail.genres.map((genre, index) => (
//                               <span
//                                 key={index}
//                                 className="text-xs bg-gray-100 px-2 py-0.5 rounded"
//                               >
//                                 {genre}
//                               </span>
//                             ))}
//                         </div>
//                         <div className="mt-2 text-sm">
//                           <div className="flex justify-between">
//                             <span>Rental Period:</span>
//                             <span>
//                               {detail.period > 1
//                                 ? `${detail.period} weeks`
//                                 : `${detail.period} week`}
//                             </span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span>Start Date:</span>
//                             <span>{formatDate(detail.rental_start)}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span>End Date:</span>
//                             <span>{formatDate(detail.rental_end)}</span>
//                           </div>
//                           <div className="flex justify-between font-medium mt-1">
//                             <span>Price:</span>
//                             <span>Rp {detail.total.toLocaleString()}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           <div className="border-t pt-3">
//             <div className="flex justify-between items-center font-bold text-lg">
//               <span>Total Amount:</span>
//               <span>Rp {rental.total_amount.toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RentalDetailsModal;
import { X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

// Define the mutation for refreshing payment token
const REFRESH_PAYMENT_TOKEN = gql`
  mutation RefreshPaymentToken($id: ID!) {
    refreshPaymentToken(id: $id) {
      _id
      token
      status
      updated_at
    }
  }
`;

const RentalDetailsModal = ({ rental, isOpen, onClose, formatDate }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Add mutation hook
  const [refreshPaymentToken] = useMutation(REFRESH_PAYMENT_TOKEN);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    if (!rental.token) {
      // If token is missing, try to refresh it first
      await handleRefreshToken();
      return;
    }

    // Close the modal
    onClose();
    // Navigate to payment page with the rental token and ID
    navigate(`/payment?token=${rental.token}&rental_id=${rental._id}`);
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    setPaymentError(null);

    try {
      const { data } = await refreshPaymentToken({
        variables: { id: rental._id },
      });

      if (data?.refreshPaymentToken?.token) {
        // Navigate to payment page with new token
        onClose();
        navigate(
          `/payment?token=${data.refreshPaymentToken.token}&rental_id=${rental._id}`
        );
      } else {
        setPaymentError("Could not generate payment token. Please try again.");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setPaymentError(error.message || "Failed to refresh payment token");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate if token might be expired (24 hours from last update)
  const isTokenLikelyExpired = () => {
    if (!rental.updated_at) return true;

    const lastUpdate = new Date(parseInt(rental.updated_at));
    const now = new Date();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);

    return hoursDiff >= 24;
  };

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
                {rental.payment_method
                  ? rental.payment_method.replace(/_/g, " ")
                  : "Not specified"}
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
                            <span>
                              {detail.period > 1
                                ? `${detail.period} weeks`
                                : `${detail.period} week`}
                            </span>
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
            <div className="flex justify-between items-center font-bold text-lg mb-4">
              <span>Total Amount:</span>
              <span>Rp {rental.total_amount.toLocaleString()}</span>
            </div>

            {/* Payment error message */}
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {paymentError}
              </div>
            )}

            {/* Add Pay Now button for pending rentals */}
            {rental.status === "pending" && (
              <>
                {isTokenLikelyExpired() ? (
                  <button
                    onClick={handleRefreshToken}
                    disabled={isRefreshing}
                    className="w-full bg-[#00A8FF] text-white py-3 rounded-full font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? "Refreshing..." : "Refresh & Pay Now"}
                  </button>
                ) : (
                  <button
                    onClick={handlePayNow}
                    disabled={isRefreshing}
                    className="w-full bg-[#00A8FF] text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? "Processing..." : "Pay Now"}
                  </button>
                )}
                {isTokenLikelyExpired() && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Payment link has expired. Click to generate a new one.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetailsModal;
