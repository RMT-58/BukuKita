import { ArrowLeft, Upload } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router";

const AddBookPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    pages: "",
    language: "",
    publishedYear: "",
    genre: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Book data submitted:", formData);
  };

  const handleBack = () => navigate(-1);

  const Select = ({ value, onValueChange, placeholder, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          type="button"
          className="w-full p-2 border border-gray-300 rounded-md flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{value || placeholder}</span>
          <span>▼</span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {React.Children.map(children, (child) =>
              React.cloneElement(child, {
                onClick: () => {
                  onValueChange(child.props.value);
                  setIsOpen(false);
                },
              })
            )}
          </div>
        )}
      </div>
    );
  };

  const SelectItem = ({ value, children, onClick }) => (
    <div
      className="p-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => onClick && onClick(value)}
    >
      {children}
    </div>
  );

  const Button = ({ type, disabled, className, children }) => (
    <button
      type={type}
      disabled={disabled}
      className={`${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="pb-20">
      <header className="md:hidden bg-white p-4 border-b flex items-center">
        <button onClick={handleBack} className="mr-4">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Add a Book</h1>
      </header>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-48 bg-gray-100 rounded-md overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 text-center">
                    Upload cover image
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
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
                Author
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
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pages"
                  className="block text-sm font-medium mb-1"
                >
                  Pages
                </label>
                <input
                  id="pages"
                  name="pages"
                  type="number"
                  value={formData.pages}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium mb-1"
                >
                  Language
                </label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    handleSelectChange("language", value)
                  }
                  placeholder="Select language"
                >
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="indonesian">Indonesian</SelectItem>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="publishedYear"
                  className="block text-sm font-medium mb-1"
                >
                  Published Year
                </label>
                <input
                  id="publishedYear"
                  name="publishedYear"
                  type="number"
                  value={formData.publishedYear}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium mb-1"
                >
                  Genre
                </label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => handleSelectChange("genre", value)}
                  placeholder="Select genre"
                >
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="science-fiction">
                    Science Fiction
                  </SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00A8FF] hover:bg-[#0096e0] text-white py-2 rounded-md"
          >
            {loading ? "Adding Book..." : "Add Book"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;
