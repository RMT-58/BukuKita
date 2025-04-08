import {
  Ban,
  Book,
  Check,
  Edit,
  Image,
  MessageCircle,
  Settings,
  ShoppingCart,
  Star,
  Wrench,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import BookPhotosModal from "./BookPhotosModal";
import { gql, useMutation, useLazyQuery } from "@apollo/client";
import { toast, Toaster } from "react-hot-toast";
import { useCartStore } from "../store/CartStore";
import { useUserStore } from "../store/UserStore";

const FIND_ROOMS_BY_USER_ID = gql`
  query FindRoomsByUserId($userId: String!) {
    findRoomsByUserId(userId: $userId) {
      _id
      user_id
      receiver_id
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($message: String!, $receiverId: String!) {
    sendMessage(message: $message, receiverId: $receiverId) {
      _id
      sender_id
      receiver_id
      message
      room_id
      read
      created_at
      updated_at
      sender {
        _id
        name
        username
        phone_number
        address
        created_at
        updated_at
      }
      receiver {
        _id
        name
        username
        phone_number
        address
        created_at
        updated_at
      }
    }
  }
`;

const BookCard = ({ book }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { user, fetchUser, isOwner } = useUserStore();

  const handleAddToCart = () => {
    addToCart(book._id);
    toast.success("Book added to cart!");
  };

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const isBookOwner = isOwner(book.uploaded_by?._id);

  const [findRooms, { data: roomsData }] = useLazyQuery(FIND_ROOMS_BY_USER_ID, {
    fetchPolicy: "network-only",
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);

  const handleChatOwner = async () => {
    try {
      // buku harus punya uploaded_by dan user sudah login
      if (!book.uploaded_by || !book.uploaded_by._id) {
        console.error("Book uploader information is missing");
        toast.error("Book uploader information is missing");
        return;
      }

      if (!user || !user._id) {
        // jika belum login, redirect ke halaman login
        navigate("/login");
        return;
      }

      const currentUserId = user._id;
      const uploaderId = book.uploaded_by._id;

      // tidak boleh chat dengan diri sendiri
      if (currentUserId === uploaderId) {
        console.log("Cannot chat with yourself");
        toast.error("Cannot chat with yourself");
        return;
      }

      // temukan room dari user
      const { data: roomsData } = await findRooms({
        variables: { userId: currentUserId },
      });

      // Check kalau udah ada room simpan di existing Room
      let existingRoom = null;
      if (roomsData && roomsData.findRoomsByUserId) {
        existingRoom = roomsData.findRoomsByUserId.find(
          (room) =>
            room.user_id === uploaderId || room.receiver_id === uploaderId
        );
      }

      if (existingRoom) {
        // kalau room ada buat chat
        navigate(`/chats/${existingRoom._id}`);
      } else {
        // kalau belumm ada room, buat room baru dan kirim pesan
        const initialMessage = `Hi, I'm interested in your book "${book.title}". Is it still available?`;

        const { data } = await sendMessage({
          variables: {
            message: initialMessage,
            receiverId: uploaderId,
          },
        });

        // Navigate ke room yang baru dibuat
        if (data && data.sendMessage && data.sendMessage.room_id) {
          navigate(`/chats/${data.sendMessage.room_id}`);
        } else {
          console.error("Failed to create chat room");
        }
      }
    } catch (error) {
      console.error("Error in chat handling:", error);
    }
  };

  const openPhotoModal = (e) => {
    e.preventDefault();
    setIsPhotoModalOpen(true);
  };

  const photos = Array.isArray(book.image_urls) ? book.image_urls : [];

  // dapatkan status dari book
  const getStatusDetails = () => {
    if (book.status === "forRent") {
      return {
        icon: <Check size={16} className="text-green-500" />,
        text: "Available for rent",
        color: "text-green-500",
      };
    } else if (book.status === "rented") {
      return {
        icon: <Ban size={16} className="text-red-500" />,
        text: "Currently rented",
        color: "text-red-500",
      };
    } else {
      return {
        icon: <Ban size={16} className="text-red-500" />,
        text: "Closed by owner",
        color: "text-red-500",
      };
    }
  };

  const statusDetails = getStatusDetails();

  // Convert condition ke bintang
  const getConditionStars = (condition) => {
    const rating = condition || 0;
    let filledStars = 0;

    if (rating <= 2) filledStars = 1;
    else if (rating <= 4) filledStars = 2;
    else if (rating <= 6) filledStars = 3;
    else if (rating <= 8) filledStars = 4;
    else filledStars = 5;

    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < filledStars ? "currentColor" : "none"}
        className={i < filledStars ? "text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm mb-4">
      <Toaster />
      <div className="p-4">
        <div className="flex">
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={book.thumbnail_url || "/placeholder.svg"}
              alt={book.title}
              // fill
              className="object-cover"
            />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <Link
                to={`/book/${book._id}`}
                className="text-[#00A8FF] font-medium hover:underline"
              >
                {book.title}
              </Link>
              {book.uploaded_by && (
                <div className="text-gray-500 text-sm flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {book.uploaded_by.address}
                </div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  {book.author}
                </p>
                <p className="text-sm font-medium mt-2 flex items-center">
                  <Book size={16} className="mr-1 text-gray-500" />
                  {book.cover_type === "hardcover" ? "Hardcover" : "Paperback"}
                </p>
                <p className="text-sm flex items-center">
                  <Settings size={16} className="mr-1 text-gray-500" />
                  Condition: {book.condition}/10
                  {book.condition_details && (
                    <Link
                      to={`/book/${book._id}`}
                      className="ml-1 text-[#00A8FF] text-xs hover:underline"
                      title={book.condition_details}
                    >
                      View further explanation
                    </Link>
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm flex items-center justify-end">
                  <svg
                    className="w-4 h-4 mr-1 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {book.uploaded_by?.name || "Unknown"}
                </p>
                <div className="flex justify-end mt-1">
                  {getConditionStars(book.condition)}
                </div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={openPhotoModal}
                  className="text-[#00A8FF] text-xs hover:underline flex items-center"
                >
                  <Image size={16} className="mr-1" />
                  View photos ({photos.length})
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {book.genres &&
                book.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    {genre}
                  </span>
                ))}
              {book.genres && book.genres.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{book.genres.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`text-sm capitalize flex items-center ${statusDetails.color}`}
              >
                {statusDetails.icon}
                <span className="ml-1">{statusDetails.text}</span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">For rent</p>
              <p className="text-sm font-medium flex items-center justify-end">
                Rp {book.price?.toLocaleString() || 0} per week
              </p>
            </div>
          </div>

          <div className="flex mt-3 gap-2">
            {isBookOwner ? (
              <button
                onClick={() => navigate(`/edit-book/${book._id}`)}
                disabled={book.status === "rented"}
                className={`flex-1 h-12 rounded flex items-center justify-center gap-2 py-2 transition-colors duration-200  ${
                  book.status === "rented"
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-white text-[#00A8FF] border border-[#00A8FF] hover:bg-[#00A8FF] hover:text-white"
                }`}
              >
                {book.status === "rented" ? (
                  <div className="relative">
                    <Book className="text-white w-5 h-5" />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 shadow">
                      <Check className="text-white w-3 h-3" />
                    </div>
                  </div>
                ) : (
                  <Edit size={18} />
                )}
                <span className="ml-1">
                  {book.status === "rented" ? "Currently Rented" : "Edit Book"}
                </span>
              </button>
            ) : (
              <>
                {/* Tombol Chat dengan Pemilik */}
                <button
                  onClick={handleChatOwner}
                  className="w-12 h-12 border border-[#00A8FF] text-[#00A8FF] rounded flex items-center justify-center hover:bg-[#f0f9ff] transition-colors duration-200"
                  title="Chat with owner"
                >
                  <MessageCircle size={20} />
                </button>

                <button
                  disabled={book.status !== "forRent"}
                  onClick={handleAddToCart}
                  className={`flex-1 ${
                    book.status !== "forRent"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#00A8FF] hover:bg-[#0098e5]"
                  } text-white rounded flex items-center justify-center gap-2 py-2 transition-colors duration-200`}
                >
                  {book.status === "rented" ? (
                    <>
                      <div className="relative">
                        <Book className="text-white w-5 h-5" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 shadow">
                          <Check className="text-white w-3 h-3" />
                        </div>
                      </div>
                      <span className="ml-1">Currently Rented</span>
                    </>
                  ) : book.status === "isClosed" ? (
                    <>
                      <Ban size={18} />
                      <span className="ml-1">Currently Unavailable</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span className="ml-1">Add Rent Period to Cart</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <BookPhotosModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photos={photos}
      />
    </div>
  );
};

export default BookCard;
