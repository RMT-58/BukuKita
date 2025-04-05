import { useState } from "react";

// slider range harga
export const PriceRangeFilter = ({ minPrice, maxPrice, onChange }) => {
  const [localMin, setLocalMin] = useState(minPrice || 0);
  const [localMax, setLocalMax] = useState(maxPrice || 1000000);

  const handleApply = () => {
    onChange({ minPrice: localMin, maxPrice: localMax });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <div>
          <label className="text-sm text-gray-500">Min Price</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Max Price</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
          />
        </div>
      </div>
      <button
        onClick={handleApply}
        className="w-full bg-[#00A8FF] text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Apply
      </button>
    </div>
  );
};
