import {
  Search,
  ShoppingCart,
  ChevronDown,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import BookCard from "../components/BookCard";
import { Link } from "react-router";
import { gql, useLazyQuery } from "@apollo/client";

const FIND_ALL_BOOKS = gql`
  query FindAll($query: String, $filters: BookFilters, $options: BookOptions) {
    findAll(query: $query, filters: $filters, options: $options) {
      pagination {
        totalPages
        totalCount
        limit
        currentPage
      }
      data {
        _id
        title
        author
        genres
        synopsis
        cover_type
        condition
        condition_details
        thumbnail_url
        image_urls
        status
        price
        uploader_id
        uploaded_by {
          _id
          name
          username
          phone_number
          address
          created_at
          updated_at
        }
        created_at
        updated_at
      }
    }
  }
`;

// mendapaatkan semua genre buku
const getAllGenres = (books) => {
  const genreSet = new Set();
  books.forEach((book) => {
    if (book.genres) {
      book.genres.forEach((genre) => genreSet.add(genre));
    }
  });
  return Array.from(genreSet);
};

// mendapatkan semua cover type buku
const getCoverTypes = (books) => {
  const coverSet = new Set();
  books.forEach((book) => {
    if (book.cover_type) {
      coverSet.add(book.cover_type);
    }
  });
  return Array.from(coverSet);
};

// slider range harga
const PriceRangeFilter = ({ minPrice, maxPrice, onChange }) => {
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

const FilterDropdown = ({
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

// filter kalau di mobile
const FilterBadge = ({ label, count, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all
        ${isActive ? "bg-[#00A8FF] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
      `}
    >
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${isActive ? "bg-white/30 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// filter bar
const FilterBar = ({
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
      {/* Desktop filter bar */}
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
          onSelect={(value) => handleFilterChange("genres", [value])}
          onClear={() => clearFilter("genres")}
          icon={<Filter size={14} />}
        />

        <FilterDropdown
          label="Cover"
          options={coverTypes}
          activeOption={activeFilters.cover_type}
          onSelect={(value) => handleFilterChange("cover_type", value)}
          onClear={() => clearFilter("cover_type")}
        />

        <FilterDropdown
          label="Status"
          options={["available", "rented", "unavailable"]}
          activeOption={activeFilters.status}
          onSelect={(value) => handleFilterChange("status", value)}
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

      {/* Mobile filter bar */}
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

        {activeFilters.genres && (
          <div className="flex items-center bg-[#00A8FF] text-white px-3 py-1.5 rounded-full text-sm">
            <span>{activeFilters.genres[0]}</span>
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
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleFilterChange("genres", [genre])}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilters.genres &&
                      activeFilters.genres.includes(genre)
                        ? "bg-[#00A8FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
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
                {["available", "rented", "unavailable"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange("status", status)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilters.status === status
                        ? "bg-[#00A8FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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

// buat pagination
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 mx-1 rounded hover:bg-gray-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i ? "bg-[#00A8FF] text-white" : "hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 mx-1 rounded hover:bg-gray-200"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center my-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center p-2 rounded ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-200 text-gray-700"
        }`}
      >
        <ChevronLeft size={16} />
        <span className="ml-1">Prev</span>
      </button>

      <div className="hidden md:flex items-center mx-4">
        {renderPageNumbers()}
      </div>

      <div className="md:hidden mx-4">
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center p-2 rounded ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-200 text-gray-700"
        }`}
      >
        <span className="mr-1">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [coverTypes, setCoverTypes] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    genres: null,
    cover_type: null,
    status: null,
  });
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const booksPerPage = 12;
  const cartCount = 2;

  const [fetchBooks, { data, loading: fetchLoading, error: fetchError }] =
    useLazyQuery(FIND_ALL_BOOKS, {
      onCompleted: (data) => {
        if (data?.findAll) {
          const fetchedBooks = data.findAll.data || [];
          const pagination = data.findAll.pagination || {};

          setBooks(fetchedBooks);
          setGenres(getAllGenres(fetchedBooks));
          setCoverTypes(getCoverTypes(fetchedBooks));

          setTotalPages(pagination.totalPages || 1);
          setTotalCount(pagination.totalCount || 0);
          setCurrentPage(pagination.currentPage || 1);
        }
        setLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching books:", error);
        setError(error.message);
        setLoading(false);
      },
    });

  // pakai use effect untuk debounce kalau ada perubahan
  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      setLoading(true);

      // filter object kosong
      const filters = {};

      if (activeFilters.genres) {
        filters.genres = activeFilters.genres;
      }

      if (activeFilters.cover_type) {
        filters.cover_type = activeFilters.cover_type;
      }

      if (activeFilters.status) {
        filters.status = activeFilters.status;
      }

      if (minPrice || maxPrice) {
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
      }

      // options object kosong
      const options = {
        limit: booksPerPage,
        skip: (currentPage - 1) * booksPerPage,
        sortField: "created_at",
        sortOrder: -1,
      };

      fetchBooks({
        variables: {
          query: searchTerm || null,
          filters: filters,
          options: options,
        },
      });
    }, 300);

    return () => clearTimeout(debouncedFetch);
  }, [
    searchTerm,
    activeFilters,
    minPrice,
    maxPrice,
    currentPage,
    fetchBooks,
    booksPerPage,
  ]);

  // animasi aja
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
      .animate-slideDown {
        animation: slideDown 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // ganti ke page pertama kalau ada perubahan filter
  };

  const clearFilter = (filterType) => {
    setActiveFilters((prev) => ({ ...prev, [filterType]: null }));
    setCurrentPage(1); // ganti ke page pertama kalau filter di clear
  };

  const handlePriceChange = ({ minPrice, maxPrice }) => {
    setMinPrice(minPrice);
    setMaxPrice(maxPrice);
    setCurrentPage(1); // ganti ke page pertama kalau ada perubahan harga
  };

  const clearPriceFilter = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setCurrentPage(1); // ganti ke page pertama kalau perubahan harga di clear
  };

  const hasActiveFilters =
    Object.values(activeFilters).some((value) => value !== null) ||
    minPrice !== null ||
    maxPrice !== null;

  const clearAllFilters = () => {
    setActiveFilters({
      genres: null,
      cover_type: null,
      status: null,
    });
    setMinPrice(null);
    setMaxPrice(null);
    setSearchTerm("");
    setCurrentPage(1); // ganti ke page pertama kalau semua filter di clear
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pb-20 md:pb-0 bg-gray-50 min-h-screen">
      <header className="bg-white border-b p-4 md:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Home</h1>
          <Link to="/cart" className="relative">
            <ShoppingCart size={24} className="text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>
      <div className="p-4 max-w-4xl mx-auto">
        {/* buat search */}
        <div
          className={`relative mb-6 transition-all duration-200 ${isSearchFocused ? "ring-2 ring-[#00A8FF] rounded-md" : ""}`}
        >
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // ganti ke page pertama kalau ada perubahan search
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full border border-gray-300 rounded-md py-2 px-10 focus:outline-none"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          {searchTerm && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
              size={18}
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1); // ganti ke page pertama kalau search di clear
              }}
            />
          )}
        </div>

        {/* Filter bar */}
        <FilterBar
          genres={genres}
          coverTypes={coverTypes}
          activeFilters={activeFilters}
          handleFilterChange={handleFilterChange}
          clearFilter={clearFilter}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          filteredCount={totalCount}
          minPrice={minPrice}
          maxPrice={maxPrice}
          handlePriceChange={handlePriceChange}
          clearPriceFilter={clearPriceFilter}
        />

        {/* List buku */}
        <div className="p-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00A8FF]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading books: {error}
            </div>
          ) : books.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 ">
                {books.map((book) => (
                  <BookCard key={book._id} book={book} isHome={true} />
                ))}
              </div>

              {/* jumlah hasil pencarian */}
              <div className="text-sm text-gray-500 text-center my-4">
                Showing {books.length} of {totalCount} books
              </div>

              {/* buat pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No books found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
