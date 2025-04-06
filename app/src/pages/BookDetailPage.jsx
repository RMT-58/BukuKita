"use client";

import {
  ArrowLeft,
  Star,
  Book,
  User,
  Tag,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  Banknote,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import logo from "../assets/logo.png";

import { useQuery, gql } from "@apollo/client";
import toast from "react-hot-toast";
import { useCartStore } from "../store/CartStore";

const FIND_BOOK_BY_ID = gql`
  query FindBookById($findBookByIdId: ID!) {
    findBookById(id: $findBookByIdId) {
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

function BookDetailPage() {
  const { bookId } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { loading, error, data } = useQuery(FIND_BOOK_BY_ID, {
    variables: { findBookByIdId: bookId },
  });

  const book = data?.findBookById;

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart(book._id);
    toast.success("Book added to cart!");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(Number.parseInt(timestamp)).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateStars = (condition) => {
    if (!condition) return 0;
    return Math.ceil(condition / 2);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-8">
        <p className="text-red-500">
          Error loading book details: {error.message}
        </p>
      </div>
    );

  if (!book) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-red-500">Book not found</p>
      </div>
    );
  }

  const allImages = [];
  if (book.thumbnail_url) {
    allImages.push(book.thumbnail_url);
  }
  if (book.image_urls && book.image_urls.length > 0) {
    allImages.push(...book.image_urls);
  }

  const displayImage = allImages[activeImage] || logo;

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <header className="bg-primary text-white md:hidden p-4 flex items-center sticky top-0 z-10 shadow-sm">
        <Link to="/" className="mr-4">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Book Details</h1>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-col md:flex-row mb-6">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={displayImage}
                  alt={book.title}
                  className="object-cover w-full h-full"
                />
              </div>

              {allImages.length > 0 && (
                <div className="flex mt-2 space-x-2 overflow-x-auto">
                  {allImages.map((url, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${activeImage === index ? "border-primary" : "border-transparent"}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`${book.title} view ${index === 0 && book.thumbnail_url ? "cover" : index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:w-2/3 md:ml-6">
              <h2 className="text-2xl font-bold text-gray-800">{book.title}</h2>
              <p className="text-gray-600 mb-3">{book.author}</p>

              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < calculateStars(book.condition) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm ml-1">
                  Condition: {book.condition}/10
                </span>
                {book.condition_details && (
                  <span className="text-sm ml-2 text-gray-500">
                    ({book.condition_details})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center">
                  <Book size={16} className="mr-2 text-primary" />
                  <div>
                    <p className="text-gray-500">Cover Type</p>
                    <p className="capitalize">{book.cover_type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Tag size={16} className="mr-2 text-primary" />
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="capitalize">
                      {book.status === "forRent" ? "Available" : "Unavailable"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-primary" />
                  <div>
                    <p className="text-gray-500">Added On</p>
                    <p>{formatDate(book.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Banknote size={16} className="mr-2 text-primary" />
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-bold text-primary">
                      {formatPrice(book.price)}
                    </p>
                  </div>
                </div>
              </div>

              {book.genres && book.genres.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-500 text-sm mb-1">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {book.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs capitalize"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={book.status !== "forRent"}
                onClick={handleAddToCart}
                className={`w-full ${book.status !== "forRent" ? "bg-gray-400" : "bg-primary hover:bg-primary/90"} text-white py-3 rounded-md font-medium transition-colors`}
              >
                {`${book.status !== "forRent" ? "Not Available yet!" : "Add Rent Period to Cart"}`}
              </button>
            </div>
          </div>
        </div>

        {book.synopsis && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{book.synopsis}</p>
          </div>
        )}

        {book.uploaded_by && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-3">Book Owner</h3>
            <div className="flex items-start">
              <div className="bg-primary/10 text-primary rounded-full p-3 mr-3">
                <User size={24} />
              </div>
              <div>
                <p className="font-medium">{book.uploaded_by.name}</p>
                <p className="text-gray-500 text-sm">
                  @{book.uploaded_by.username}
                </p>

                {book.uploaded_by.phone_number && (
                  <div className="flex items-center mt-2 text-sm">
                    <Phone size={14} className="mr-1 text-gray-500" />
                    <span>{book.uploaded_by.phone_number}</span>
                  </div>
                )}

                {book.uploaded_by.address && (
                  <div className="flex items-center mt-1 text-sm">
                    <MapPin size={14} className="mr-1 text-gray-500" />
                    <span>{book.uploaded_by.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetailPage;
