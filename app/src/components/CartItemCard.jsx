import React from "react";
import { Trash2, Minus, Plus, Calendar } from "lucide-react";
import { useCartStore } from "../store/CartStore";
import { toast } from "react-hot-toast";

const CartItemCard = ({ item }) => {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updatePeriod = useCartStore((state) => state.updatePeriod);
  const updateStartDate = useCartStore((state) => state.updateStartDate);

  const handleRemove = () => {
    removeFromCart(item._id);
    toast.success("Item removed from cart");
  };

  const today = new Date().toISOString().split("T")[0];

  // maksimal pinjam 3 bulan (12 weeks)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split("T")[0];

  const handleDateChange = (e) => {
    updateStartDate(item._id, e.target.value);
    toast.success("Rental start date updated");
  };

  const calculateEndDate = () => {
    if (!item.startDate) return "";
    const startDate = new Date(item.startDate);
    const endDate = new Date(startDate);
    // Calculate end date by adding weeks instead of days
    endDate.setDate(startDate.getDate() + item.period * 7);
    return endDate.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-md shadow-sm p-4 mb-4">
      <div className="flex">
        <img
          src={item.thumbnail_url || item.coverImage}
          alt={item.title}
          className="w-20 h-28 object-cover rounded mr-4"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.author}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="mt-2 flex flex-col space-y-1">
            <p className="text-xs text-gray-500">
              Format:{" "}
              <span className="text-gray-700">
                {item.cover_type || item.format}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Condition: <span className="text-gray-700">{item.condition}</span>
            </p>
            <p className="text-xs text-gray-500">
              Period:{" "}
              <span className="text-gray-700">
                {item.period > 1
                  ? `${item.period} weeks`
                  : `${item.period} week`}
              </span>
            </p>
          </div>

          <div className="mt-2 flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Calendar size={14} className="text-gray-500" />
              <p className="text-xs text-gray-500">Rental Period:</p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Start:</span>
                <input
                  type="date"
                  value={item.startDate || today}
                  min={today}
                  max={maxDateString}
                  onChange={handleDateChange}
                  className="border rounded px-2 py-1 text-xs"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">End:</span>
                <span className="border rounded px-2 py-1 bg-gray-50">
                  {calculateEndDate()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center border rounded-full overflow-hidden">
              <button
                onClick={() => updatePeriod(item._id, item.period - 1)}
                className="px-2 py-1 bg-gray-100"
                disabled={item.period <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-3">
                {item.period > 1
                  ? `${item.period} weeks`
                  : `${item.period} week`}
              </span>
              <button
                onClick={() => updatePeriod(item._id, item.period + 1)}
                className="px-2 py-1 bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="font-medium">
              {item.currency || ""}{" "}
              {(item.price * item.period).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
