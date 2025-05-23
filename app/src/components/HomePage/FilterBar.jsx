import { useState } from "react";
import { FilterDropdown } from "./FilterDropDown";
import { Filter, X } from "lucide-react";
import { FilterBadge } from "./FilterBadge";
import { PriceRangeFilter } from "./PriceRangeFilter";

export const FilterBar = ({
  genres,
  coverTypes,
  activeFilters,
  handleFilterChange,
  clearFilter,
  hasActiveFilters,
  clearAllFilters,
  filteredCount,
  handlePriceChange,
  minPrice,
  maxPrice,
  clearPriceFilter,
}) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  return (
    <>
      {/* Desktop  */}
      <div className="hidden md:flex flex-wrap items-center gap-2 mb-6">
        <FilterBadge
          label="All"
          count={filteredCount}
          isActive={!hasActiveFilters}
          onClick={clearAllFilters}
        />

        <FilterDropdown
          label="Genre"
          options={genres}
          activeOption={activeFilters.genres}
          onSelect={(value) => handleFilterChange("genres", value)}
          onClear={() => clearFilter("genres")}
          icon={<Filter size={14} />}
          multiSelect={true}
        />

        <FilterDropdown
          label="Cover"
          options={coverTypes}
          activeOption={
            activeFilters.cover_type
              ? activeFilters.cover_type === "hardcover"
                ? "Hardcover"
                : "Paperback"
              : null
          }
          onSelect={(value) =>
            handleFilterChange(
              "cover_type",
              value === "Hardcover" ? "hardcover" : "paperback"
            )
          }
          onClear={() => clearFilter("cover_type")}
        />

        <FilterDropdown
          label="Status"
          options={["Available for Rent", "Currently Rented", "Unavailable"]}
          activeOption={
            activeFilters.status
              ? activeFilters.status === "forRent"
                ? "Available for Rent"
                : activeFilters.status === "rented"
                  ? "Currently Rented"
                  : "Unavailable"
              : null
          }
          onSelect={(value) =>
            handleFilterChange(
              "status",
              value === "Available for Rent"
                ? "forRent"
                : value === "Currently Rented"
                  ? "rented"
                  : "isClosed"
            )
          }
          onClear={() => clearFilter("status")}
        />

        <FilterDropdown
          label="Price"
          isPriceFilter={true}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          onClear={clearPriceFilter}
        />

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-auto text-[#00A8FF] text-sm flex items-center hover:underline transition-all"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`
              flex items-center space-x-1 px-3 py-2 rounded-full text-sm
              ${hasActiveFilters ? "bg-[#00A8FF] text-white" : "bg-gray-100 text-gray-700"}
            `}
        >
          <Filter size={14} className="mr-1" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-white/30 text-white text-xs px-1.5 rounded-full ml-1">
              {Object.values(activeFilters).filter(Boolean).length +
                (minPrice || maxPrice ? 1 : 0)}
            </span>
          )}
        </button>

        <FilterBadge
          label="All"
          count={filteredCount}
          isActive={!hasActiveFilters}
          onClick={clearAllFilters}
        />

        {activeFilters.genres &&
          Array.isArray(activeFilters.genres) &&
          activeFilters.genres.length > 0 && (
            <div className="flex items-center bg-[#00A8FF] text-white px-3 py-1.5 rounded-full text-sm">
              <span>Genres ({activeFilters.genres.length})</span>
              <X
                size={14}
                className="ml-1 cursor-pointer"
                onClick={() => clearFilter("genres")}
              />
            </div>
          )}

        {activeFilters.cover_type && (
          <div className="flex items-center bg-[#00A8FF] text-white px-3 py-1.5 rounded-full text-sm">
            <span>{activeFilters.cover_type}</span>
            <X
              size={14}
              className="ml-1 cursor-pointer"
              onClick={() => clearFilter("cover_type")}
            />
          </div>
        )}

        {activeFilters.status && (
          <div className="flex items-center bg-[#00A8FF] text-white px-3 py-1.5 rounded-full text-sm">
            <span>{activeFilters.status}</span>
            <X
              size={14}
              className="ml-1 cursor-pointer"
              onClick={() => clearFilter("status")}
            />
          </div>
        )}

        {(minPrice || maxPrice) && (
          <div className="flex items-center bg-[#00A8FF] text-white px-3 py-1.5 rounded-full text-sm">
            <span>
              {minPrice && maxPrice
                ? `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
                : minPrice
                  ? `Min: ${minPrice.toLocaleString()}`
                  : `Max: ${maxPrice.toLocaleString()}`}
            </span>
            <X
              size={14}
              className="ml-1 cursor-pointer"
              onClick={clearPriceFilter}
            />
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-auto text-[#00A8FF] text-sm flex-shrink-0"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Mobile filter panel */}
      {showFilterPanel && (
        <div className="md:hidden bg-white p-4 rounded-lg shadow-lg mb-4 animate-slideDown">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Filters</h3>
            <X
              size={18}
              onClick={() => setShowFilterPanel(false)}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Genre</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => {
                  const isSelected =
                    Array.isArray(activeFilters.genres) &&
                    activeFilters.genres.includes(genre);

                  return (
                    <button
                      key={genre}
                      onClick={() => {
                        const currentGenres = Array.isArray(
                          activeFilters.genres
                        )
                          ? [...activeFilters.genres]
                          : [];

                        const genreIndex = currentGenres.indexOf(genre);

                        if (genreIndex >= 0) {
                          currentGenres.splice(genreIndex, 1);
                        } else {
                          currentGenres.push(genre);
                        }

                        handleFilterChange("genres", currentGenres);
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isSelected
                          ? "bg-[#00A8FF] text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Cover Type</p>
              <div className="flex flex-wrap gap-2">
                {coverTypes.map((cover) => (
                  <button
                    key={cover}
                    onClick={() => handleFilterChange("cover_type", cover)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilters.cover_type === cover
                        ? "bg-[#00A8FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cover}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Available for Rent", value: "forRent" },
                  { label: "Currently Rented", value: "rented" },
                  { label: "Unavailable", value: "isClosed" },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handleFilterChange("status", value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilters.status === value
                        ? "bg-[#00A8FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Price Range</p>
              <PriceRangeFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChange={handlePriceChange}
              />
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={() => {
                  setShowFilterPanel(false);
                }}
                className="w-full py-2 bg-[#00A8FF] text-white rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
