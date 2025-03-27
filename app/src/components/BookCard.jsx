import { Star } from "lucide-react";
import React from "react";

const BookCard = () => {
  return (
    <div className="bg-white p-4 mb-4 shadow-sm rounded-lg">
      <div className="flex">
        <img
          src="https://img.freepik.com/free-psd/world-forest-day-poster-template_23-2148899237.jpg?ga=GA1.1.1688332347.1741569485&semt=ais_hybrid"
          alt="Book Cover"
          className="w-20 h-28 object-cover rounded-md mr-4"
        />

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vision of the Anointed</h2>
            <span className="text-xs text-gray-500">3km</span>
          </div>

          <p className="text-sm text-gray-600">Thomas Sowell</p>

          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-600 mr-2">Paperback</span>
            <span className="text-sm font-semibold bg-gray-100 px-2 rounded">
              Condition: 8.5/10
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">
                <Star size={16} fill="currentColor" />
              </span>
              <span className="text-sm">Justin James</span>
            </div>

            <div className="flex space-x-2">
              <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                View photos
              </button>
              <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                View further explanation
              </button>
            </div>
          </div>

          <div className="flex mt-2 space-x-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Economics
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Non-fiction
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Politics
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">+1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
