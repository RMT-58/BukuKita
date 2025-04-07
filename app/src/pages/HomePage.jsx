import { Search, ShoppingCart, X } from "lucide-react";
import { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import { Link } from "react-router";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { FilterBar } from "../components/HomePage/FilterBar";
import { Pagination } from "../components/HomePage/Pagination";

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

const GET_CURRENT_USER = gql`
  query Me {
    me {
      _id
      name
      username
    }
  }
`;

const GET_MY_ROOMS = gql`
  query GetMyRooms {
    myRooms {
      _id
      user_id
      receiver_id
      created_at
      updated_at
      unreadCount
      user {
        _id
        name
        username
      }
      receiver {
        _id
        name
        username
      }
      chats {
        _id
        sender_id
        receiver_id
        message
        read
        created_at
      }
    }
  }
`;

// mendapaatkan semua genre buku
const genreOptions = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Biography",
  "Autobiography",
  "Memoir",
  "History",
  "Self-Help",
  "Children",
  "Young Adult",
  "New Adult",
  "Poetry",
  "Comics",
  "Graphic Novel",
  "Art",
  "Photography",
  "Cooking",
  "Travel",
  "Religion",
  "Spirituality",
  "Science",
  "Technology",
  "Philosophy",
  "Psychology",
  "Education",
  "Health",
  "Wellness",
  "Parenting",
  "Business",
  "Economics",
  "Politics",
  "Law",
  "True Crime",
  "Sports",
  "Music",
  "Drama",
  "Satire",
  "Anthology",
  "Classic",
  "Adventure",
  "Dystopian",
  "LGBTQ+",
  "Environmental",
  "Short Stories",
  "Essays",
  "Journal",
  "Reference",
  "Guide",
  "Diary",
];

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
          setGenres(genreOptions);
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
      fetchPolicy: "no-cache",
    });

  // pakai use effect untuk debounce kalau ada perubahan
  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      setLoading(true);

      // filter object kosong
      const filters = {};

      if (
        activeFilters.genres &&
        Array.isArray(activeFilters.genres) &&
        activeFilters.genres.length > 0
      ) {
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

  // ambil current user
  const { data: userData } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "no-cache",
  });

  const {
    loading: loadingMyRoom,
    error: errorMyRoom,
    data: myRoomData,
    refetch,
  } = useQuery(GET_MY_ROOMS, {
    fetchPolicy: "network-only",
  });

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
    (activeFilters.genres &&
      Array.isArray(activeFilters.genres) &&
      activeFilters.genres.length > 0) ||
    activeFilters.cover_type !== null ||
    activeFilters.status !== null ||
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
              {/* <div className="text-sm text-gray-500 text-center my-4">
                Showing {books.length} of {totalCount} books
              </div> */}

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
