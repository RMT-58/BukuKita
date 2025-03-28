import { Minus, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";

const CartItemCard = ({ item, onUpdate, onRemove }) => {
  const [rentalDays, setRentalDays] = useState(item.quantity || 1);
  const [isEditing, setIsEditing] = useState(false);

  const perDayPrice = item.price;
  const totalPrice = perDayPrice * rentalDays;

  const handleDaysChange = (newDays) => {
    const updatedDays = Math.max(1, newDays);
    setRentalDays(updatedDays);
    onUpdate(item.id, updatedDays);
  };

  const handleManualInput = (e) => {
    const value = e.target.value;
    const parsedValue = value === "" ? 1 : Math.max(1, parseInt(value, 10));
    setRentalDays(parsedValue);
    onUpdate(item.id, parsedValue);
    setIsEditing(false);
  };

  return (
    <div key={item.id} className="bg-white rounded-md shadow-sm mb-4">
      <div className="p-4">
        <div className="flex">
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={item.coverImage}
              alt={item.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <Link
                to={`/book/${item.id}`}
                className="text-[#00A8FF] font-medium hover:underline"
              >
                {item.title}
              </Link>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:bg-red-50 rounded-full p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-2">
              <p className="text-sm">{item.author}</p>
              <p className="text-sm font-medium">{item.format}</p>
              <p className="text-sm">Condition: {item.condition}</p>
            </div>

            <div className="mt-2">
              <p className="text-sm text-gray-500">Rent Period</p>
              <p className="text-sm">{item.availablePeriod}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDaysChange(rentalDays - 1)}
              className="bg-gray-100 rounded-full p-1"
            >
              <Minus size={16} />
            </button>
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={rentalDays}
                onChange={(e) =>
                  setRentalDays(Math.max(1, parseInt(e.target.value, 10)))
                }
                onBlur={handleManualInput}
                onKeyDown={(e) => e.key === "Enter" && handleManualInput(e)}
                className="w-12 text-center border rounded px-1"
                autoFocus
              />
            ) : (
              <span
                className="px-3 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {rentalDays} {rentalDays === 1 ? "Day" : "Days"}
              </span>
            )}
            <button
              onClick={() => handleDaysChange(rentalDays + 1)}
              className="bg-gray-100 rounded-full p-1"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="text-right">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500">Price Details</p>
              <p className="text-xs text-gray-500">
                {item.currency} {perDayPrice.toLocaleString()} / day
              </p>
              <p className="text-sm font-medium">
                Total: {item.currency} {totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
