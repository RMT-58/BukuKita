import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast, Toaster } from "react-hot-toast";
import { gql, useMutation, useQuery } from "@apollo/client";

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

const UPDATE_BOOK_MUTATION = gql`
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

const coverTypes = ["Hardcover", "Paperback"];
const conditions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const statusOptions = ["For Rent", "Closed"];
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
  "History",
  "Self-Help",
  "Children",
  "Young Adult",
  "Poetry",
  "Comics",
  "Art",
  "Cooking",
  "Travel",
  "Religion",
  "Science",
];

function EditBookPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    synopsis: "",
    price: "",
    cover_type: "",
    condition: 0,
    condition_details: "",
    status: "",
    genres: [],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Fetch book data
  const { loading: fetchLoading, error: fetchError } = useQuery(
    FIND_BOOK_BY_ID,
    {
      variables: { findBookByIdId: id },
      onCompleted: (data) => {
        const book = data.findBookById;

        setFormData({
          title: book.title || "",
          author: book.author || "",
          synopsis: book.synopsis || "",
          price: book.price ? book.price.toString() : "",
          cover_type: book.cover_type || "",
          condition: book.condition || 0,
          condition_details: book.condition_details || "",
          status: book.status || "",
          genres: Array.isArray(book.genres) ? book.genres : [],
        });

        if (book.thumbnail_url) {
          setThumbnailPreview(book.thumbnail_url);
        }

        if (Array.isArray(book.image_urls) && book.image_urls.length > 0) {
          setExistingImages(book.image_urls);
          setAdditionalPreviews(book.image_urls);
        }
      },
      onError: (error) => {
        setErrorMessage("Failed to fetch book details. Please try again.");
        toast.error("Failed to fetch book details.");
        console.error("Error fetching book:", error);
      },
    }
  );

  const [updateBook, { loading: updateLoading }] = useMutation(
    UPDATE_BOOK_MUTATION,
    {
      onCompleted: () => {
        toast.success("Book updated successfully! Redirecting...");
        navigate("/library");
      },
      onError: (error) => {
        setErrorMessage(error.message || "Update failed!");
        toast.error(error.message || "Update failed!");
        console.error(error);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData((prev) => {
      const currentGenres = prev.genres;
      if (currentGenres.includes(genre)) {
        return { ...prev, genres: currentGenres.filter((g) => g !== genre) };
      } else {
        return { ...prev, genres: [...currentGenres, genre] };
      }
    });
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setAdditionalImages((prev) => [...prev, ...newFiles]);
      setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeAdditionalImage = (index) => {
    // If it's an existing image
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Adjust index for newly added images
      const newIndex = index - existingImages.length;
      setAdditionalImages((prev) => prev.filter((_, i) => i !== newIndex));
    }

    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Function for image upload (placeholder)
  const uploadImages = async () => {
    try {
      // mock upload function
      const mockUpload = async (file) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return `https://your-upload-service.com/${file.name}`;
      };

      let thumbnailUrl = "";
      if (thumbnailFile) {
        thumbnailUrl = await mockUpload(thumbnailFile);
      } else if (thumbnailPreview && thumbnailPreview.startsWith("http")) {
        // Keep the existing thumbnail URL
        thumbnailUrl = thumbnailPreview;
      }

      // Start with existing images that haven't been removed
      const imageUrls = [...existingImages];

      // Add newly uploaded images
      for (const file of additionalImages) {
        const url = await mockUpload(file);
        imageUrls.push(url);
      }

      return { thumbnailUrl, imageUrls };
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { thumbnailUrl, imageUrls } = await uploadImages();

      const input = {
        title: formData.title,
        author: formData.author,
        synopsis: formData.synopsis,
        condition: parseInt(formData.condition),
        condition_details: formData.condition_details,
        cover_type: formData.cover_type,
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        genres: formData.genres,
      };

      // Only add image fields if they've changed
      if (thumbnailUrl) {
        input.thumbnail_url = thumbnailUrl;
      }

      if (imageUrls.length > 0) {
        input.image_urls = imageUrls;
      }

      await updateBook({
        variables: {
          updateBookId: id,
          input,
        },
      });
    } catch (err) {
      console.error("Error updating book:", err);
      setErrorMessage("Failed to update book. Please try again.");
      toast.error("Failed to update book. Please try again.");
    }
  };

  const handleBack = () => navigate(-1);

  if (fetchLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (fetchError)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">
          Error loading book details. Please try again.
        </div>
      </div>
    );

  return (
    <div className="pb-20">
      <Toaster />
      <header className="md:hidden bg-white p-4 border-b flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Edit Book</h1>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium mb-2 self-start">
                Cover Image
              </label>
              <div className="relative w-40 h-56 bg-gray-100 rounded-md overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Cover preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 text-center px-2">
                      Upload cover image
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 400x600px
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Title*
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="block text-sm font-medium mb-1"
                >
                  Author*
                </label>
                <input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium mb-1"
                >
                  Price / day
                </label>
                <div className="relative flex items-center">
                  <span
                    className="absolute left-3 text-gray-500"
                    aria-hidden="true"
                  >
                    Rp.
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Price in Indonesian Rupiah"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="synopsis"
              className="block text-sm font-medium mb-1"
            >
              Synopsis
            </label>
            <textarea
              id="synopsis"
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="cover_type"
                className="block text-sm font-medium mb-1"
              >
                Cover Type
              </label>
              <select
                id="cover_type"
                name="cover_type"
                value={formData.cover_type}
                onChange={(e) =>
                  handleSelectChange("cover_type", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select cover type</option>
                {coverTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-medium mb-1"
              >
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={(e) =>
                  handleSelectChange("condition", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select condition</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={(e) => handleSelectChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="condition_details"
              className="block text-sm font-medium mb-1"
            >
              Condition Details
            </label>
            <textarea
              id="condition_details"
              name="condition_details"
              value={formData.condition_details}
              onChange={handleChange}
              rows={2}
              placeholder="Describe the condition in more detail (optional)"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre.toLowerCase())}
                  className={`px-3 py-1 text-sm rounded-full ${
                    formData.genres.includes(genre.toLowerCase())
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Images
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {additionalPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative h-32 bg-gray-100 rounded-md overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="h-32 bg-gray-100 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer">
                <Plus size={24} className="text-gray-400 mb-1" />
                <p className="text-xs text-gray-500 text-center">Add image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdditionalImagesChange}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-md font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateLoading}
              className={`flex-1 bg-[#00A8FF] hover:bg-[#0096e0] text-white py-3 rounded-md font-medium ${
                updateLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {updateLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookPage;
