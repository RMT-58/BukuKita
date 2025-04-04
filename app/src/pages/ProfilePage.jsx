import React from "react";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { gql, useQuery } from "@apollo/client";
import logo from "../assets/logo.png";

const GET_PROFILE = gql`
  query Me {
    me {
      _id
      name
      username
      phone_number
      address
      created_at
      updated_at
    }
  }
`;

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
      uploaded_by
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

const ProfilePage = () => {
  const navigate = useNavigate();

  const {
    loading: loadingProfile,
    error: errorProfile,
    data: profileData,
  } = useQuery(GET_PROFILE);

  const {
    loading: loadingBooks,
    error: errorBooks,
    data: booksData,
  } = useQuery(GET_MY_BOOKS);

  const {
    loading: loadingRentals,
    error: errorRentals,
    data: rentalsData,
  } = useQuery(GET_MY_RENTALS);

  const isLoading = loadingProfile || loadingBooks || loadingRentals;

  const hasError = errorProfile || errorBooks || errorRentals;

  const profile = profileData?.me || {};
  const books = booksData?.myBooks || [];
  const rentals = rentalsData?.myRentals || [];

  // hitung total books and books rented
  const booksAdded = books.length;
  const booksRented = rentals.reduce(
    (total, rental) => total + (rental.details?.length || 0),
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-bold">Error loading profile</p>
          <p>
            {errorProfile?.message ||
              errorBooks?.message ||
              errorRentals?.message ||
              "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      <header className="bg-white p-4 border-b md:hidden">
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              <img
                src={profile.avatar || logo}
                alt={profile.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = logo;
                }}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold">{profile.name || "User"}</h2>
          <p className="text-gray-600">
            {profile.username || "No username provided"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{booksRented}</p>
            <p className="text-gray-600">Books Rented</p>
          </div>
          <div className="bg-gray-50 rounded-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{booksAdded}</p>
            <p className="text-gray-600">Books Added</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleEditProfile}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <User size={20} className="text-gray-500 mr-3" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleSettings}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <Settings size={20} className="text-gray-500 mr-3" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-md hover:bg-gray-100 w-full text-left"
          >
            <LogOut size={20} className="text-gray-500 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
