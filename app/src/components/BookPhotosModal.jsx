import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const BookPhotosModal = ({
  isOpen,
  onClose,
  photos,
  initialPhotoIndex = 0,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);

  useEffect(() => {
    setCurrentPhotoIndex(initialPhotoIndex);
  }, [photos, initialPhotoIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentPhotoIndex, photos, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handlePrevious = () => {
    if (photos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (photos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
        aria-label="Close photo viewer"
      >
        <X size={24} />
      </button>

      <div className="absolute top-4 left-4 text-white text-sm">
        {photos.length > 0
          ? `${currentPhotoIndex + 1} / ${photos.length}`
          : "No photos"}
      </div>

      <div className="w-full max-w-4xl max-h-full p-4">
        {photos.length > 0 ? (
          <div className="relative">
            <div className="flex items-center justify-center h-full">
              <img
                src={photos[currentPhotoIndex]}
                alt={`Book photo ${currentPhotoIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-md"
              />
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 focus:outline-none"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 focus:outline-none"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-white text-center">No photos available</div>
        )}

        {photos.length > 1 && (
          <div className="flex overflow-x-auto gap-2 mt-4 pb-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 ${
                  currentPhotoIndex === index
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPhotosModal;
