import React, { useState } from "react";
import { User, Settings, LogOut, Edit } from "lucide-react";
import { useNavigate } from "react-router";

const mockProfile = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwdIVSqaMsmZyDbr9mDPk06Nss404fosHjLg&s",
  booksRented: 12,
  booksAdded: 5,
};

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const profile = mockProfile;

  const handleLogout = () => {
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleSettings = () => {
    console.log("Settings");
  };

  return (
    <div className="pb-20 md:pb-0">
      <header className="bg-white p-4 border-b md:hidden">
        <h1 className="text-xl font-bold">Profile</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-md p-4 text-center">
            <p className="text-2xl font-bold text-[#00A8FF]">
              {profile.booksRented}
            </p>
            <p className="text-gray-600">Books Rented</p>
          </div>
          <div className="bg-gray-50 rounded-md p-4 text-center">
            <p className="text-2xl font-bold text-[#00A8FF]">
              {profile.booksAdded}
            </p>
            <p className="text-gray-600">Books Added</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleEditProfile}
            className="flex items-center p-3 rounded-md hover:bg-gray-50 w-full text-left"
          >
            <User size={20} className="text-gray-500 mr-3" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleSettings}
            className="flex items-center p-3 rounded-md hover:bg-gray-50 w-full text-left"
          >
            <Settings size={20} className="text-gray-500 mr-3" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-md hover:bg-gray-50 w-full text-left"
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
