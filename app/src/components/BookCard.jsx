import { Edit, Image, Star } from "lucide-react";
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

const BookCard = ({ book, isHome }) => {
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

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm mb-4">
      <Toaster />
      <div className="p-4">
        <div className="flex">
          <div className="relative w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={book.thumbnail_url || "/placeholder.svg"}
              alt={book.title}
              fill
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
                <div className="text-gray-500 text-sm">
                  {book.uploaded_by.address}
                </div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">{book.author}</p>
                <p className="text-sm font-medium mt-2 ">
                  {book.cover_type === "hardcover" ? "Hardcover" : "Paperback"}
                </p>
                <p className="text-sm">
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
                <p className="text-sm">{book.uploaded_by?.name || "Unknown"}</p>
                <div className="flex text-yellow-400 mt-1">
                  {[...Array(5)].map((_, i) => {
                    const rating = book.condition || 0;

                    let filledStars = 0;
                    if (rating <= 2) filledStars = 1;
                    else if (rating <= 4) filledStars = 2;
                    else if (rating <= 6) filledStars = 3;
                    else if (rating <= 8) filledStars = 4;
                    else filledStars = 5;

                    return (
                      <Star
                        key={i}
                        size={14}
                        fill={i < filledStars ? "currentColor" : "none"}
                        className={i < filledStars ? "" : "text-gray-300"}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {photos.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={openPhotoModal}
                  className="text-[#00A8FF] text-xs hover:underline flex items-center"
                >
                  <Image size={14} className="mr-1" />
                  View photos ({photos.length})
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {book.genres &&
                book.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
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
              <p className="text-sm capitalize">
                {book.status === "forRent"
                  ? "Available for rent"
                  : "Closed/Currently rented"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">For rent</p>
              <p className="text-sm font-medium">
                Rp {book.price?.toLocaleString() || 0} per day
              </p>
            </div>
          </div>

          <div className="flex mt-3 gap-2">
            {isBookOwner ? (
              <button
                onClick={() => navigate(`/edit-book/${book._id}`)}
                className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center gap-2 py-2"
              >
                <Edit size={18} />
                Edit Book
              </button>
            ) : (
              <>
                <button
                  onClick={handleChatOwner}
                  className="w-12 h-12 border border-[#00A8FF] text-[#00A8FF] rounded flex items-center justify-center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z"
                      stroke="#00A8FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isHome ? (
                  <button
                    disabled={book.status !== "forRent"}
                    onClick={handleAddToCart}
                    className={`flex-1 ${book.status !== "forRent" ? "bg-gray-400" : "bg-primary hover:bg-primary/90"} text-white rounded flex items-center justify-center py-2`}
                  >
                    {`${book.status !== "forRent" ? "Not Available yet!" : "Add Rent Period to Cart"}`}
                  </button>
                ) : (
                  <Link
                    to={`/book/${book._id}`}
                    className="flex-1 bg-[#00A8FF] text-white rounded flex items-center justify-center py-2"
                  >
                    View Details
                  </Link>
                )}
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
