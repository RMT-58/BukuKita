import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Star,
  ChevronLeft,
} from "lucide-react";
import CartItemCard from "../components/CartItemCard";

const mockCartItems = [
  {
    id: "1",
    title: "Vision of the Anointed",
    author: "Thomas Sowell",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/en/d/d1/The_vision_of_the_annointed_bookcover.jpg",
    format: "Paperback",
    condition: "8.5/10",
    price: 5000,
    currency: "Rp",
    quantity: 1,
    availablePeriod: "1 year (12/04/2025 - 12/04/2026)",
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    coverImage: "https://cdn.gramedia.com/uploads/items/9780451524935.jpg",
    format: "Paperback",
    condition: "7.5/10",
    price: 4500,
    currency: "Rp",
    quantity: 2,
    availablePeriod: "3 months (12/04/2025 - 12/07/2025)",
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const navigate = useNavigate();

  const updateQuantity = (id, newQuantity) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="md:hidden bg-white p-4 border-b flex items-center">
        <button onClick={handleCancel} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">My Cart</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {cartItems.length === 0 ? (
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
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            <div className="bg-white rounded-md shadow-sm p-4 mt-4">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500">Subtotal</p>
                <p>Rp {calculateTotal().toLocaleString()}</p>
              </div>
              <div className="flex justify-between mb-4">
                <p className="text-gray-500">Service Fee</p>
                <p>Rp 500</p>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <p>Total</p>
                <p>Rp {(calculateTotal() + 500).toLocaleString()}</p>
              </div>
            </div>

            <button className="w-full bg-[#00A8FF] text-white py-3 rounded-full mt-4 font-medium">
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
