import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PriceRangeFilter } from "./PriceRangeFilter";

export const FilterDropdown = ({
  label,
  options,
  activeOption,
  onSelect,
  onClear,
  icon,
  isPriceFilter = false,
  minPrice,
  maxPrice,
  onPriceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onClear();
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  const priceLabel = () => {
    if (minPrice && maxPrice) {
      return `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
    } else if (minPrice) {
      return `Min: ${minPrice.toLocaleString()}`;
    } else if (maxPrice) {
      return `Max: ${maxPrice.toLocaleString()}`;
    }
    return "";
  };

  const hasActivePrice = minPrice || maxPrice;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-full text-sm transition-all duration-200
          ${activeOption || hasActivePrice ? "bg-[#00A8FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
        `}
      >
        {icon && <span className="mr-1">{icon}</span>}
        <span>{label}</span>
        {isPriceFilter && hasActivePrice && (
          <span className="mx-1 text-xs bg-white/30 px-2 rounded-full">
            {priceLabel()}
          </span>
        )}
        {!isPriceFilter && activeOption && (
          <span className="mx-1 text-xs bg-white/30 px-2 rounded-full">
            {activeOption}
          </span>
        )}
        {activeOption || hasActivePrice ? (
          <X
            size={14}
            onClick={handleClear}
            className="hover:scale-110 transition-transform"
          />
        ) : (
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-10 min-w-48 max-h-60 overflow-y-auto py-1 animate-fadeIn"
          style={{
            animation: "fadeIn 0.2s ease-in-out",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            width: isPriceFilter ? "280px" : "auto",
          }}
        >
          {isPriceFilter ? (
            <PriceRangeFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChange={onPriceChange}
            />
          ) : (
            options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150
                  ${activeOption === option ? "bg-gray-100 text-[#00A8FF] font-medium" : "text-gray-700"}
                `}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
