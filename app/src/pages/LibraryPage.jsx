import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import MyBookCard from "../components/MyBookCard";
import RentalDetailsModal from "../components/RentalDetailsModal";
import { useSearchParams } from "react-router";
import { useNavigate } from "react-router";

const GET_MY_BOOKS = gql`
  query MyBooks {
    myBooks {
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
`;

const GET_MY_RENTALS = gql`
  query MyRentals {
    myRentals {
      _id
      user_id
      total_amount
      status
      payment_method
      paid_date
      created_at
      updated_at
      token
      redirect_url
      details {
        _id
        book_id
        price
        period
        total
        title
        author
        genres
        synopsis
        cover_type
        thumbnail_url
        image_urls
        rental_id
        rental_start
        rental_end
        created_at
        updated_at
      }
    }
  }
`;

const UPDATE_BOOK = gql`
  mutation UpdateBook($updateBookId: ID!, $input: UpdateBookInput!) {
    updateBook(id: $updateBookId, input: $input) {
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
        username
      }
      created_at
      updated_at
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($deleteBookId: ID!) {
    deleteBook(id: $deleteBookId)
  }
`;

const REFRESH_PAYMENT_TOKEN = gql`
  mutation RefreshPaymentToken($id: ID!) {
    refreshPaymentToken(id: $id) {
      _id
      token
      status
      updated_at
    }
  }
`;

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRental, setSelectedRental] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [updateBook] = useMutation(UPDATE_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);
  const [refreshingRental, setRefreshingRental] = useState(null);
  const [refreshPaymentToken] = useMutation(REFRESH_PAYMENT_TOKEN);

  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();

  // const handlePayNow = (rental) => {
  //   navigate(`/payment?token=${rental.token}&rental_id=${rental._id}`);
  // };
  const handlePayNow = async (rental) => {
    // Check if token is likely expired (24 hours from update)
    const isTokenExpired = () => {
      if (!rental.updated_at) return true;

      const lastUpdate = new Date(parseInt(rental.updated_at));
      const now = new Date();
      const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);

      return hoursDiff >= 24;
    };

    if (isTokenExpired()) {
      // Refresh token if expired
      setRefreshingRental(rental._id);
      try {
        const { data } = await refreshPaymentToken({
          variables: { id: rental._id },
        });

        if (data?.refreshPaymentToken?.token) {
          navigate(
            `/payment?token=${data.refreshPaymentToken.token}&rental_id=${rental._id}`
          );
        } else {
          console.error("Could not refresh payment token");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      } finally {
        setRefreshingRental(null);
      }
    } else {
      // Use existing token
      navigate(`/payment?token=${rental.token}&rental_id=${rental._id}`);
    }
  };

  useEffect(() => {
    if (paymentStatus) {
      switch (paymentStatus) {
        case "success":
          setStatusMessage({
            type: "success",
            message: "Payment completed successfully!",
          });
          break;
        case "pending":
          setStatusMessage({
            type: "warning",
            message:
              "Payment is pending. We'll update your rental once it's confirmed.",
          });
          break;
        case "failed":
          setStatusMessage({
            type: "error",
            message: "Payment failed. Please try again or contact support.",
          });
          break;
        case "cancelled":
          setStatusMessage({
            type: "info",
            message: "Payment was cancelled.",
          });
          break;
        default:
          setStatusMessage(null);
      }

      // Clear message after 5 seconds
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const {
    loading: loadingBooks,
    error: errorBooks,
    data: booksData,
    refetch: refetchBooks,
  } = useQuery(GET_MY_BOOKS, {
    skip: activeTab !== "mybooks",
  });

  const {
    loading: loadingRentals,
    error: errorRentals,
    data: rentalsData,
    refetch: refetchRentals,
  } = useQuery(GET_MY_RENTALS, {
    skip: activeTab === "mybooks",
  });

  useEffect(() => {
    if (activeTab === "mybooks") {
      refetchBooks();
    } else {
      refetchRentals();
    }
  }, [activeTab, refetchBooks, refetchRentals]);

  const handleDeleteSuccess = () => {
    // Refetch books list after successful deletion
    refetchBooks();
  };

  const currentDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const openRentalDetails = (rental) => {
    setSelectedRental(rental);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRental(null);
  };

  const filteredRentals = useMemo(() => {
    if (
      loadingRentals ||
      errorRentals ||
      !rentalsData ||
      !rentalsData.myRentals
    ) {
      return [];
    }

    return rentalsData.myRentals.filter((rental) => {
      // Filter rental berdasarkan status pending
      if (activeTab === "pending" && rental.status !== "pending") {
        return false;
      }

      // Filter rental pending dari tab lain
      if (activeTab !== "pending" && rental.status === "pending") {
        return false;
      }

      // Menangani status rental yang failed dan pindah ke history
      // Rental dengan status failed akan selalu masuk ke tab history
      // terlepas dari tanggal rental_end
      if (activeTab === "history" && rental.status === "failed") {
        return true;
      }

      if (
        activeTab !== "pending" &&
        rental.details &&
        rental.details.length > 0
      ) {
        const isExpired = rental.details.every((detail) => {
          const rentalEndDate = Number(detail.rental_end);
          return new Date(rentalEndDate) <= currentDate;
        });

        // Jika rental berstatus failed, maka termasuk history meski belum expired
        const isFailedRental = rental.status === "failed";

        if (
          (activeTab === "active" && (isExpired || isFailedRental)) ||
          (activeTab === "history" && !isExpired && !isFailedRental)
        ) {
          return false;
        }
      }

      if (searchQuery && rental.details && rental.details.length > 0) {
        return rental.details.some(
          (detail) =>
            detail.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            detail.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return true;
    });
  }, [
    activeTab,
    currentDate,
    loadingRentals,
    errorRentals,
    rentalsData,
    searchQuery,
  ]);

  const filteredBooks = useMemo(() => {
    if (activeTab === "mybooks") {
      if (loadingBooks || errorBooks || !booksData || !booksData.myBooks) {
        return [];
      }

      return booksData.myBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [];
  }, [activeTab, booksData, errorBooks, loadingBooks, searchQuery]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString();
  };

  return (
    <div className="pb-20 md:pb-0 bg-gray-50 min-h-screen">
      <header className="bg-white p-4 border-b md:hidden">
        <h1 className="text-xl font-bold">Library</h1>
      </header>
      <div className="p-4 max-w-4xl mx-auto">
        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-700"
                : statusMessage.type === "warning"
                  ? "bg-yellow-50 text-yellow-700"
                  : statusMessage.type === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
            }`}
          >
            {statusMessage.message}
          </div>
        )}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        <div className="flex mb-6 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "active"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "pending"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border-x border-gray-200`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "history"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border-r border-gray-200`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab("mybooks")}
            className={`flex-1 py-3 font-medium transition-all duration-200 ${
              activeTab === "mybooks"
                ? "bg-[#00A8FF] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            My Books
          </button>
        </div>

        {(activeTab === "mybooks" && loadingBooks) ||
        (activeTab !== "mybooks" && loadingRentals) ? (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (activeTab === "mybooks" && errorBooks) ||
          (activeTab !== "mybooks" && errorRentals) ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (activeTab === "mybooks" && filteredBooks.length === 0) ||
          (activeTab !== "mybooks" && filteredRentals.length === 0) ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === "active"
                ? "No active rentals"
                : activeTab === "pending"
                  ? "No pending rentals"
                  : activeTab === "history"
                    ? "No rental history found"
                    : "You haven't uploaded any books yet"}
            </p>
            {activeTab === "mybooks" && (
              <button
                onClick={() => (window.location.href = "/add-book")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "mybooks"
              ? filteredBooks.map((book) => (
                  <MyBookCard
                    key={book._id}
                    book={book}
                    onUpdateStatus={updateBook}
                    onDeleteStatus={deleteBook}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                ))
              : filteredRentals.map((rental) => (
                  <div
                    key={rental._id}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          Order #{rental._id.substring(rental._id.length - 6)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(rental.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rental.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : rental.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rental.status.charAt(0).toUpperCase() +
                            rental.status.slice(1)}
                        </div>
                        <div className="font-semibold">
                          Rp {rental.total_amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Books: </span>
                        {rental.details && rental.details.length} items
                      </div>
                      <div className="flex items-center gap-2">
                        {rental.status === "pending" && (
                          <button
                            onClick={() => handlePayNow(rental)}
                            disabled={refreshingRental === rental._id}
                            className="text-white bg-[#00A8FF] px-3 py-1 text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                          >
                            {refreshingRental === rental._id
                              ? "Processing..."
                              : "Pay Now"}
                          </button>
                        )}
                        <button
                          onClick={() => openRentalDetails(rental)}
                          className="text-[#00A8FF] text-sm font-medium hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedRental && (
        <RentalDetailsModal
          rental={selectedRental}
          isOpen={isModalOpen}
          onClose={closeModal}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default LibraryPage;
