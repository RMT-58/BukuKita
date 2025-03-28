import { Minus, Plus, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const CartItemCard = ({ item, onUpdate, onRemove }) => {
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
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              className="bg-gray-100 rounded-full p-1"
            >
              <Minus size={16} />
            </button>
            <span className="px-3">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="bg-gray-100 rounded-full p-1"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Per day</p>
            <p className="text-sm font-medium">
              {item.currency} {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
