import React, { useState } from "react";
import { ChevronLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router";

const EditProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Book enthusiast and casual reader",
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
  });

  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updating profile:", formData);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="pb-20 md:pb-0">
      <header className="bg-white p-4 border-b flex items-center">
        <button onClick={handleCancel} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-[#00A8FF] text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <Camera size={16} />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border rounded-md"
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 p-3 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-[#00A8FF] text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
