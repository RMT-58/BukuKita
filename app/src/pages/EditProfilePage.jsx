import React, { useState, useEffect } from "react";
import { ChevronLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router";
import { gql, useQuery, useMutation } from "@apollo/client";
import logo from "../assets/logo.png";
import { Toaster, toast } from "react-hot-toast";

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

const UPDATE_PROFILE = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
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

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone_number: "",
    address: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("/placeholder.svg");
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const { loading, error, data } = useQuery(GET_PROFILE);

  const [updateUser, { loading: updating, error: updateError }] = useMutation(
    UPDATE_PROFILE,
    {
      onCompleted: () => {
        setIsFormChanged(false);
        toast.success("Profile updated successfully!");
      },
      onError: (error) => {
        console.error("Error updating profile:", error);
      },
    }
  );

  useEffect(() => {
    if (data?.me) {
      setFormData({
        name: data.me.name || "",
        username: data.me.username || "",
        phone_number: data.me.phone_number || "",
        address: data.me.address || "",
      });

      if (data.me.avatar) {
        setAvatarPreview(data.me.avatar);
      }
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setIsFormChanged(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setIsFormChanged(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateInput = {
        name: formData.name,
        phone_number: formData.phone_number,
        address: formData.address,
      };

      // If we have a new avatar file, we would handle it here
      // This would typically involve uploading to a storage service first
      // and then including the resulting URL in the updateInput
      if (avatarFile) {
        // Example (pseudocode):
        // const avatarUrl = await uploadAvatarToStorage(avatarFile);
        // updateInput.avatar = avatarUrl;
        console.log("Would upload avatar:", avatarFile.name);
      }

      await updateUser({
        variables: {
          input: updateInput,
        },
        refetchQueries: [{ query: GET_PROFILE }],
      });
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-bold">Error loading profile</p>
          <p>{error.message || "Something went wrong"}</p>
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
      <Toaster />
      <header className="md:hidden bg-white p-4 border-b flex items-center">
        <button onClick={handleCancel} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = logo;
                }}
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
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

        {updateError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-bold">Error saving changes</p>
            <p>{updateError.message || "Something went wrong"}</p>
          </div>
        )}

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
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              disabled
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-2 border text-gray-500 bg-gray-50 rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full p-2 border text-gray-700 rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border rounded-md"
              placeholder="Where You Live"
            />
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 p-3 border rounded-md text-gray-700 hover:bg-gray-50"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 p-3 ${
                isFormChanged
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-300 cursor-not-allowed"
              } text-white rounded-md`}
              disabled={!isFormChanged || updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
