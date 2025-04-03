import { ArrowLeft, Star } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const mockBook = {
  id: "1",
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  coverImage: "/placeholder.svg?height=300&width=200",
  rating: 4.5,
  description:
    "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
  pages: 180,
  language: "English",
  publishedYear: 1925,
};

function BookDetailPage({ bookId }) {
  const loading = false;
  const error = null;
  const book = mockBook;

  const handleAddToCart = () => {
    console.log("handle add to cart");
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <p>Loading book details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center p-8">
        <p className="text-red-500">Error loading book details</p>
      </div>
    );

  return (
    <div className="pb-20">
      <header className="bg-white md:hidden p-4 border-b flex items-center">
        <Link to={-1} className="mr-4">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Book Details</h1>
      </header>

      <div className="p-4">
        <div className="flex mb-6">
          <div className="relative w-32 h-48 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={book.coverImage || "/placeholder.svg"}
              alt={book.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold">{book.title}</h2>
            <p className="text-gray-600 mb-2">{book.author}</p>

            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${i < Math.floor(book.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm ml-1">{book.rating}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Pages</p>
                <p>{book.pages}</p>
              </div>
              <div>
                <p className="text-gray-500">Language</p>
                <p>{book.language}</p>
              </div>
              <div>
                <p className="text-gray-500">Year</p>
                <p>{book.publishedYear}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">Description</h3>
          <p className="text-sm text-gray-700">{book.description}</p>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
        >
          Rent Book
        </button>
      </div>
    </div>
  );
}

export default BookDetailPage;
