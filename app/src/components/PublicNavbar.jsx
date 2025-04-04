import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const navigateToSection = (sectionId) => {
    if (isAuthPage) {
      // kalau dari auth page, navigate ke public page
      navigate(`/${sectionId}`);
    } else {
      // kalau dari public page, scroll ke section yang dipilih
      const element = document.getElementById(sectionId.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    if (!isAuthPage && location.hash) {
      const sectionId = location.hash.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location, isAuthPage]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 shadow-sm backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl text-blue-600">
              BukuKita
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigateToSection("#features")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Features
            </button>
            <button
              onClick={() => navigateToSection("#how-it-works")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => navigateToSection("#testimonials")}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Testimonials
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
