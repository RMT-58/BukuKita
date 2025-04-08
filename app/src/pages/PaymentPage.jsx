// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router";

// export const PaymentPage = () => {
//   const [searchParams] = useSearchParams();
//   const paymentToken = searchParams.get("token");
//   //   console.log(token);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // document.ready() = function () {
//     // SnapToken acquired from previous step
//     window.snap.pay(paymentToken, {
//       // Optional
//       onSuccess: function (result) {
//         // console.log(result);
//         navigate("/library");
//       },
//       // Optional
//       onPending: function (result) {
//         console.log(result);
//       },
//       // Optional
//       onError: function (result) {
//         console.log(result);
//       },
//     });
//     // };
//   }, []);

//   return (
//     <div>
//       <h1>Payment Page</h1>
//       <p>This is the payment page.</p>
//     </div>
//   );
// };

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { gql, useMutation } from "@apollo/client";

// Add mutation to manually update status (as a fallback)
const UPDATE_RENTAL_STATUS = gql`
  mutation UpdateRentalStatus($id: ID!, $input: UpdateRentalStatusInput!) {
    updateRentalStatus(id: $id, input: $input) {
      _id
      status
      payment_method
    }
  }
`;

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const paymentToken = searchParams.get("token");
  const rentalId = searchParams.get("rental_id");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const paymentInitialized = useRef(false);

  const [updateRentalStatus] = useMutation(UPDATE_RENTAL_STATUS);

  useEffect(() => {
    // Prevent multiple initializations
    if (paymentInitialized.current) return;

    if (!paymentToken) {
      setError("Payment token is missing");
      setIsLoading(false);
      return;
    }

    // Initialize Snap
    const initPayment = () => {
      try {
        // Set flag to prevent multiple initializations
        paymentInitialized.current = true;

        window.snap.pay(paymentToken, {
          onSuccess: function (result) {
            console.log("Payment success:", result);

            // Try to update status on the client side as a fallback
            // if (rentalId) {
            //   updateRentalStatus({
            //     variables: {
            //       id: rentalId,
            //       input: {
            //         status: "completed",
            //         payment_method: result.payment_type || "midtrans",
            //       },
            //     },
            //   }).catch((err) =>
            //     console.error("Error updating rental status:", err)
            //   );
            // }

            // Redirect with success parameter
            navigate("/library?payment=success");
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            navigate("/library?payment=pending");
          },
          onError: function (result) {
            console.error("Payment error:", result);
            setError("Payment failed. Please try again.");
            setTimeout(() => navigate("/library?payment=failed"), 3000);
          },
          onClose: function () {
            console.log("Customer closed the payment window");
            navigate("/library?payment=cancelled");
          },
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing payment:", error);
        setError("Failed to initialize payment");
        setIsLoading(false);
      }
    };

    // Simple check if Snap is loaded with timeout
    const checkSnapAndInitialize = () => {
      if (window.snap) {
        initPayment();
      } else {
        setTimeout(checkSnapAndInitialize, 500);
      }
    };

    // Start checking for Snap
    checkSnapAndInitialize();

    // Cleanup function
    return () => {
      // No specific cleanup needed
    };
  }, [paymentToken, rentalId, navigate, updateRentalStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 max-w-md">
          <p className="font-medium">Payment Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate("/library")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <p className="text-gray-500">Processing your payment...</p>
      </div>
    </div>
  );
};
