// import React, { useState } from "react";
// import { useNavigate } from "react-router";
// import { ChevronLeft } from "lucide-react";
// import { gql, useQuery } from "@apollo/client";
// import { useCartStore } from "../store/CartStore";

// const GET_CURRENT_USER = gql`
//   query Me {
//     me {
//       _id
//       name
//       username
//       phone_number
//       address
//     }
//   }
// `;

// const CheckoutPage = () => {
//   // ambil user yang login
//   const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER, {
//     fetchPolicy: "no-cache",
//   });

//   // ambil cart state dari store zustand
//   const bookDetails = useCartStore((state) => state.bookDetails);
//   const loading = useCartStore((state) => state.loading);
//   const calculateTotal = useCartStore((state) => state.calculateTotal);
//   const checkout = useCartStore((state) => state.checkout);

//   const navigate = useNavigate();

//   const [paymentMethod, setPaymentMethod] = useState("CASH");
//   const [checkoutError, setCheckoutError] = useState(null);
//   const [checkoutSuccess, setCheckoutSuccess] = useState(false);
//   const [rentalId, setRentalId] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleCancel = () => {
//     navigate("/cart");
//   };

//   const handlePaymentMethodChange = (e) => {
//     setPaymentMethod(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setCheckoutError(null);
//     setIsProcessing(true);

//     try {
//       if (!userData?.me?._id) {
//         throw new Error("User not authenticated");
//       }

//       const result = await checkout(userData.me._id, paymentMethod);
//       setCheckoutSuccess(true);
//       setRentalId(result._id);

//       // setTimeout(() => {
//       //   navigate(`/library`, { state: { fromCheckout: true } });
//       // }, 2000);
//       navigate(`/payment?token=${result.token}`);
//     } catch (error) {
//       setCheckoutError(error.message || "Failed to complete checkout");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (userLoading || loading || isProcessing) {
//     return (
//       <div className="bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-500">Processing your order...</p>
//         </div>
//       </div>
//     );
//   }

//   if (checkoutSuccess) {
//     return (
//       <div className="bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-8 h-8 text-green-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M5 13l4 4L19 7"
//               ></path>
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
//           <p className="text-gray-600 mb-4">
//             Your rental has been successfully created.
//           </p>
//           <p className="text-sm text-gray-500 mb-4">Rental ID: {rentalId}</p>
//           <p className="text-sm text-gray-500">
//             Redirecting you to your rental details...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen pb-20">
//       <header className="md:hidden bg-white p-4 border-b flex items-center">
//         <button onClick={handleCancel} className="mr-4">
//           <ChevronLeft size={24} />
//         </button>
//         <h1 className="text-xl font-bold">Checkout</h1>
//       </header>

//       <div className="p-4 max-w-4xl mx-auto">
//         <div className="bg-white rounded-md shadow-sm p-4 mb-4">
//           <h2 className="font-semibold text-lg mb-3">Order Summary</h2>

//           {bookDetails.map((book) => (
//             <div
//               key={book._id}
//               className="flex items-center justify-between py-2 border-b last:border-0"
//             >
//               <div className="flex items-center">
//                 <img
//                   src={book.thumbnail_url}
//                   alt={book.title}
//                   className="w-12 h-16 object-cover rounded mr-3"
//                 />
//                 <div>
//                   <p className="font-medium">{book.title}</p>
//                   <p className="text-sm text-gray-500">
//                     {book.period === 1
//                       ? "1 week rental"
//                       : `${book.period} weeks rental`}
//                   </p>
//                 </div>
//               </div>
//               <p>Rp {(book.price * book.period).toLocaleString()}</p>
//             </div>
//           ))}

//           <div className="mt-4 pt-2 border-t">
//             <div className="flex justify-between">
//               <p className="font-semibold">Total</p>
//               <p className="font-semibold">
//                 Rp {calculateTotal().toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="bg-white rounded-md shadow-sm p-4 mb-4">
//             <h2 className="font-semibold text-lg mb-3">Shipping Address</h2>
//             <div className="p-3 bg-gray-50 rounded">
//               <p className="font-medium">{userData?.me?.name}</p>
//               <p className="text-gray-600">{userData?.me?.phone_number}</p>
//               <p className="text-gray-600">
//                 {userData?.me?.address || "No address provided"}
//               </p>
//             </div>
//           </div>

//           <div className="bg-white rounded-md shadow-sm p-4 mb-4">
//             <h2 className="font-semibold text-lg mb-3">Payment Method</h2>

//             <div className="space-y-2">
//               <label className="flex items-center p-3 border rounded cursor-pointer">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="CASH"
//                   checked={paymentMethod === "CASH"}
//                   onChange={handlePaymentMethodChange}
//                   className="mr-2"
//                 />
//                 <span>Cash on Delivery</span>
//               </label>

//               <label className="flex items-center p-3 border rounded cursor-pointer">
//                 <input
//                   type="radio"
//                   name="paymentMethod"
//                   value="TRANSFER"
//                   checked={paymentMethod === "TRANSFER"}
//                   onChange={handlePaymentMethodChange}
//                   className="mr-2"
//                 />
//                 <span>Bank Transfer</span>
//               </label>
//             </div>
//           </div>

//           {checkoutError && (
//             <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
//               {checkoutError}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading || isProcessing}
//             className={`w-full bg-[#00A8FF] text-white py-3 rounded-full font-medium ${
//               loading || isProcessing ? "opacity-70 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading || isProcessing
//               ? "Processing..."
//               : `Pay Rp ${calculateTotal().toLocaleString()}`}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { gql, useQuery } from "@apollo/client";
import { useCartStore } from "../store/CartStore";

const GET_CURRENT_USER = gql`
  query Me {
    me {
      _id
      name
      username
      phone_number
      address
    }
  }
`;

const CheckoutPage = () => {
  // ambil user yang login
  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "no-cache",
  });

  // ambil cart state dari store zustand
  const bookDetails = useCartStore((state) => state.bookDetails);
  const loading = useCartStore((state) => state.loading);
  const calculateTotal = useCartStore((state) => state.calculateTotal);
  const checkout = useCartStore((state) => state.checkout);

  const navigate = useNavigate();

  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [rentalId, setRentalId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = () => {
    navigate("/cart");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsProcessing(true);

    try {
      if (!userData?.me?._id) {
        throw new Error("User not authenticated");
      }

      // No longer passing payment method as it will be selected in Midtrans
      const result = await checkout(userData.me._id);
      setCheckoutSuccess(true);
      setRentalId(result._id);

      navigate(`/payment?token=${result.token}`);
    } catch (error) {
      setCheckoutError(error.message || "Failed to complete checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (userLoading || loading || isProcessing) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">
            Your rental has been successfully created.
          </p>
          <p className="text-sm text-gray-500 mb-4">Rental ID: {rentalId}</p>
          <p className="text-sm text-gray-500">
            Redirecting you to your rental details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="md:hidden bg-white p-4 border-b flex items-center">
        <button onClick={handleCancel} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-md shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-lg mb-3">Order Summary</h2>

          {bookDetails.map((book) => (
            <div
              key={book._id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center">
                <img
                  src={book.thumbnail_url}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded mr-3"
                />
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-500">
                    {book.period === 1
                      ? "1 week rental"
                      : `${book.period} weeks rental`}
                  </p>
                </div>
              </div>
              <p>Rp {(book.price * book.period).toLocaleString()}</p>
            </div>
          ))}

          <div className="mt-4 pt-2 border-t">
            <div className="flex justify-between">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">
                Rp {calculateTotal().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-md shadow-sm p-4 mb-4">
            <h2 className="font-semibold text-lg mb-3">Shipping Address</h2>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">{userData?.me?.name}</p>
              <p className="text-gray-600">{userData?.me?.phone_number}</p>
              <p className="text-gray-600">
                {userData?.me?.address || "No address provided"}
              </p>
            </div>
          </div>

          {checkoutError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {checkoutError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isProcessing}
            className={`w-full bg-[#00A8FF] text-white py-3 rounded-full font-medium ${
              loading || isProcessing ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading || isProcessing
              ? "Processing..."
              : `Pay Now Rp ${calculateTotal().toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
