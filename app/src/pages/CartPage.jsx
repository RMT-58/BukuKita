import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import CartItemCard from "../components/CartItemCard";
import { useCartStore } from "../store/CartStore";

const CartPage = () => {
  // Zustand store
  const items = useCartStore((state) => state.items);
  const bookDetails = useCartStore((state) => state.bookDetails);
  const loading = useCartStore((state) => state.loading);
  const error = useCartStore((state) => state.error);
  const detailsFetched = useCartStore((state) => state.detailsFetched);
  const serviceFee = useCartStore((state) => state.serviceFee);

  // ambil action dari store
  const fetchBookDetails = useCartStore((state) => state.fetchBookDetails);
  const calculateTotal = useCartStore((state) => state.calculateTotal);

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch book details
  useEffect(() => {
    const loadBookDetails = async () => {
      if (items.length > 0 && !detailsFetched && !loadingDetails) {
        try {
          setLoadingDetails(true);
          await fetchBookDetails();
        } catch (error) {
          console.error("Error fetching book details:", error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    loadBookDetails();
  }, [items, fetchBookDetails, detailsFetched, loadingDetails]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    navigate("/checkout");
  };

  if ((loading || loadingDetails) && items.length > 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#00A8FF] text-white px-4 py-2 rounded-full"
          >
            Retry
          </button>
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
        <h1 className="text-xl font-bold">My Cart</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {items.length === 0 ? (
          <div className="text-center mt-12">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-[#00A8FF] text-white px-6 py-2 rounded-full"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <>
            {bookDetails.map((book) => (
              <CartItemCard
                key={book._id}
                item={{
                  _id: book._id,
                  title: book.title,
                  author: book.author,
                  thumbnail_url: book.thumbnail_url,
                  cover_type: book.cover_type,
                  condition: book.condition,
                  price: book.price,
                  currency: "Rp",
                  period: book.period,
                  startDate: book.startDate,
                  availablePeriod: `${book.period} days`,
                }}
              />
            ))}

            <div className="bg-white rounded-md shadow-sm p-4 mt-4">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500">Subtotal</p>
                <p>Rp {(calculateTotal() - serviceFee).toLocaleString()}</p>
              </div>
              <div className="flex justify-between mb-4">
                <p className="text-gray-500">Service Fee</p>
                <p>Rp {serviceFee.toLocaleString()}</p>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <p>Total</p>
                <p>Rp {calculateTotal().toLocaleString()}</p>
              </div>
            </div>

            <button
              className={`w-full bg-[#00A8FF] text-white py-3 rounded-lg mt-4 font-medium ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
