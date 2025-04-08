"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import readingAnimation from "../assets/reading-animation.json";

import Lottie from "lottie-react";
import {
  Clock,
  Plus,
  Home,
  Shield,
  Recycle,
  Calendar,
  ThumbsUp,
  BookOpen,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  ChevronDown,
  ArrowRight,
  Star,
} from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate } from "react-router";

// Initialize GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

const NotFound = () => {
  const headerRef = useRef(null);

  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // delay untuk animasi loading
    const timer = setTimeout(() => setIsLoaded(true), 300);

    // animasi hero section
    const headerTimeline = gsap.timeline();
    headerTimeline.fromTo(
      ".hero-title",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    headerTimeline.fromTo(
      ".hero-subtitle",
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.7"
    );
    headerTimeline.fromTo(
      ".hero-cta",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      "-=0.5"
    );

    // animasi fitur section
    gsap.utils.toArray(".feature-card").forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          delay: i * 0.2,
        }
      );
    });

    // animasi stats - count up trigger ketika kelihatan
    if (statsRef.current) {
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: "top 80%",
        onEnter: () => {
          setStatsVisible(true);
          gsap.to(".stats-container", { opacity: 1, duration: 1 });
        },
        onLeaveBack: () => {
          setStatsVisible(false);
        },
      });
    }

    // animasi cta section
    if (ctaRef.current) {
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            ctaRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1 }
          );
        },
      });
    }

    //  animation typing text
    const typeText = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
    });

    typeText
      .to(".typing-text", {
        duration: 2,
        text: "Read More. Save More.",
        ease: "none",
      })
      .to(".typing-text", { duration: 1, delay: 1, text: "" })
      .to(".typing-text", {
        duration: 2,
        text: "Discover Your Next Favorite Book.",
        ease: "none",
      })
      .to(".typing-text", { duration: 1, delay: 1, text: "" })
      .to(".typing-text", {
        duration: 2,
        text: "Share Knowledge. Build Community.",
        ease: "none",
      })
      .to(".typing-text", { duration: 1, delay: 1, text: "" });

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  return (
    <div className="bg-white font-sans">
      <section
        ref={headerRef}
        className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="hero-title text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Uh-oh! Page Not Found!
              </h1>
              <p className="hero-subtitle text-xl text-gray-600 mb-8">
                You seem to have stumbled upon a page that doesn't exist...
              </p>
              <div className="hero-cta flex space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Browse Books
                </button>
                <a
                  href="/public"
                  className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition"
                >
                  Go Home
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md">
                <Lottie
                  animationData={readingAnimation}
                  loop={true}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* fitur Section */}

      {/* stats Section */}

      {/* How It Works Section */}

      {/* Featured Books Section */}

      {/* Testimonials */}

      {/* FAQ Section */}

      {/* App Download Section */}

      {/* Call to Action */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BukuKita</h3>
              <p className="text-gray-400 mb-6">
                Connecting readers, sharing books, building community.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Browse Books
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Book Condition Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Safety Tips
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Report an Issue
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
              <p className="text-gray-400 mb-4">
                Get book recommendations and community updates.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 rounded-l-lg focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} BukuKita. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
