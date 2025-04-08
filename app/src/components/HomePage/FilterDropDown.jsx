import { ChevronDown, X, Check } from "lucide-react";
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
  multiSelect = false,
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
    if (multiSelect) {
      // If multiSelect is true, we handle arrays
      const currentSelections = Array.isArray(activeOption)
        ? [...activeOption]
        : [];
      const optionIndex = currentSelections.indexOf(option);

      if (optionIndex >= 0) {
        // Remove option if already selected
        currentSelections.splice(optionIndex, 1);
      } else {
        // Add option if not already selected
        currentSelections.push(option);
      }

      onSelect(currentSelections);
      // Don't close dropdown for multi-select
    } else {
      // Single selection behavior
      onSelect(option);
      setIsOpen(false);
    }
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
  const hasActiveOptions = Array.isArray(activeOption)
    ? activeOption.length > 0
    : Boolean(activeOption);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`
          flex items-center space-x-1 px-3 py-2 rounded-full text-sm transition-all duration-200
          ${hasActiveOptions || hasActivePrice ? "bg-[#00A8FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
        `}
      >
        {icon && <span className="mr-1">{icon}</span>}
        <span>{label}</span>

        {isPriceFilter && hasActivePrice && (
          <span className="mx-1 text-xs bg-white/30 px-2 rounded-full">
            {priceLabel()}
          </span>
        )}

        {!isPriceFilter && !multiSelect && activeOption && (
          <span className="mx-1 text-xs bg-white/30 px-2 rounded-full">
            {activeOption}
          </span>
        )}

        {!isPriceFilter &&
          multiSelect &&
          Array.isArray(activeOption) &&
          activeOption.length > 0 && (
            <span className="mx-1 text-xs bg-white/30 px-2 rounded-full">
              {activeOption.length}
            </span>
          )}

        {hasActiveOptions || hasActivePrice ? (
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
            options.map((option) => {
              const isSelected = multiSelect
                ? Array.isArray(activeOption) && activeOption.includes(option)
                : activeOption === option;

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between
                    ${isSelected ? "bg-gray-100 text-[#00A8FF] font-medium" : "text-gray-700"}
                  `}
                >
                  <span>{option}</span>
                  {multiSelect && isSelected && (
                    <Check size={16} className="text-[#00A8FF]" />
                  )}
                </button>
              );
            })
          )}

          {multiSelect &&
            Array.isArray(activeOption) &&
            activeOption.length > 0 && (
              <div className="px-4 py-2 border-t">
                <button
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="w-full py-1 bg-[#00A8FF] text-white rounded text-sm"
                >
                  Apply ({activeOption.length})
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
