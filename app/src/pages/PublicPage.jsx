"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import readingAnimation from "../assets/reading-animation.json";
import bookAppAnimation from "../assets/book-app-animation.json";
import shareBookAnimation from "../assets/share-book-animation.json";
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
import mobile1 from "../assets/appMobile1.png";
import mobile2 from "../assets/appMobile2.png";
import { toast, Toaster } from "react-hot-toast";

// Initialize GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

const PublicPage = () => {
  const navigation = useNavigate();
  const headerRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
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
      scrollTrigger: {
        trigger: ".typing-text",
        start: "top 70%",
      },
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

  // mock buku untuk carousel
  const featuredBooks = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      price: 7000,
      cover:
        "https://ebooks.gramedia.com/ebook-covers/58773/image_highres/11yi8g3ib2xxv7awz0otes7syxy49c.jpg",
      color: "bg-indigo-500",
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      price: 3000,
      cover:
        "https://upload.wikimedia.org/wikipedia/commons/0/06/Atomic_habits.jpg",
      color: "bg-emerald-500",
    },
    {
      id: 3,
      title: "Educated",
      author: "Tara Westover",
      price: 4000,
      cover:
        "https://cdn.penguin.co.uk/dam-assets/books/9780099511021/9780099511021-jacket-large.jpg",
      color: "bg-amber-500",
    },
    {
      id: 4,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      price: 5000,
      cover: "https://cdn.gramedia.com/uploads/items/591701404_sapiens.jpg",
      color: "bg-blue-500",
    },
    {
      id: 5,
      title: "Dune",
      price: 2000,
      author: "Frank Herbert",
      cover:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD3W7sNidiZiEmcK5XoxY_2ChpNROwqTHr-Q&s",
      color: "bg-orange-500",
    },
  ];

  const showToastCommingSoon = () => {
    toast("🚀 Coming Soon!", {
      duration: 3000,
      position: "top-center",
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  };

  return (
    <div className="bg-white font-sans">
      <Toaster />
      <section
        ref={headerRef}
        className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="hero-title text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Community Book Rental Marketplace
              </h1>
              <p className="hero-subtitle text-xl text-gray-600 mb-8">
                Discover, rent, and share books with people in your community.
                Save money while reducing environmental impact.
              </p>
              <div className="hero-cta flex space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                >
                  Browse Books
                </button>
                <a
                  href="#features"
                  className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition"
                >
                  Learn More
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

      <section className="py-12 bg-blue-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="typing-text text-3xl md:text-4xl font-bold min-h-[4rem]"></h2>
          </div>
        </div>
      </section>

      {/* fitur Section */}
      <section id="features" ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BukuKita?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers unique features designed to make book rental
              simple, affordable, and community-focused.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg inline-block mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Save Time & Money
              </h3>
              <p className="text-gray-600">
                Rent books at a fraction of the purchase price. No need to buy
                books you'll only read once.
              </p>
            </motion.div>

            <motion.div
              className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-green-100 text-green-600 p-3 rounded-lg inline-block mb-4">
                <Home className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Focused
              </h3>
              <p className="text-gray-600">
                Connect with fellow readers in your area. Share recommendations
                and build a local reading community.
              </p>
            </motion.div>

            <motion.div
              className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg inline-block mb-4">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Extra Income
              </h3>
              <p className="text-gray-600">
                Earn money by listing your books for rent. Turn your bookshelf
                into a source of passive income.
              </p>
            </motion.div>

            <motion.div
              className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-amber-100 text-amber-600 p-3 rounded-lg inline-block mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Transactions
              </h3>
              <p className="text-gray-600">
                Our platform guarantees secure payment processing and identity
                verification for safety and peace of mind.
              </p>
            </motion.div>

            <motion.div
              className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-red-100 text-red-600 p-3 rounded-lg inline-block mb-4">
                <Recycle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Eco-Friendly
              </h3>
              <p className="text-gray-600">
                Reduce waste by sharing resources. Each book rental helps lower
                the environmental impact of book production.
              </p>
            </motion.div>

            <motion.div
              className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg inline-block mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flexible Rental Periods
              </h3>
              <p className="text-gray-600">
                Choose rental periods that work for you. From a weekend to
                several months, you set your own timeline.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* stats Section */}
      <section ref={statsRef} className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="stats-container opacity-0 text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Growing Community
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of readers who are already saving money and sharing
              their love for books.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {statsVisible && (
                  <CountUp end={15000} duration={2.5} separator="," />
                )}
                {!statsVisible && "0"}+
              </p>
              <p className="text-xl text-blue-100">Active Users</p>
            </div>
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {statsVisible && (
                  <CountUp end={45000} duration={2.5} separator="," />
                )}
                {!statsVisible && "0"}+
              </p>
              <p className="text-xl text-blue-100">Books Available</p>
            </div>
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {statsVisible && (
                  <CountUp end={28000} duration={2.5} separator="," />
                )}
                {!statsVisible && "0"}+
              </p>
              <p className="text-xl text-blue-100">Completed Rentals</p>
            </div>
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-bold mb-2">
                {statsVisible && <CountUp end={95} duration={2.5} suffix="%" />}
                {!statsVisible && "0%"}
              </p>
              <p className="text-xl text-blue-100">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How BukuKita Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple process connects book owners with readers in just a few
              easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <Lottie
                  animationData={bookAppAnimation}
                  loop={true}
                  className="w-48 h-48"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. List or Browse
              </h3>
              <p className="text-gray-600">
                List your books for rent or browse available titles in your
                area. Set your own rental prices and terms.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <Lottie
                  animationData={shareBookAnimation}
                  loop={true}
                  className="w-48 h-48"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Reserve & Connect
              </h3>
              <p className="text-gray-600">
                Reserve books you want to read and arrange pickup or delivery
                with the owner through our secure messaging system.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center">
                  <ThumbsUp className="h-24 w-24 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Enjoy & Return
              </h3>
              <p className="text-gray-600">
                Enjoy your book during the rental period, then return it when
                you're done. Rate your experience and help build trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trending Books
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what your community is reading right now.
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            className="pb-12"
          >
            {featuredBooks.map((book) => (
              <SwiperSlide key={book.id}>
                <motion.div
                  className="bg-white rounded-xl overflow-hidden shadow-lg h-96"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div
                    className={`${book.color} h-48 flex items-center justify-center`}
                  >
                    <div className="w-32 h-48 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 bg-white p-1">
                      <div className="relative w-full h-full">
                        <img
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-gray-600 text-sm ml-1">(42)</span>
                      </div>
                      <span className="font-bold text-green-600">
                        Rp. {book.price}/day
                      </span>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What People Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from members of our book-loving community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ajat D.",
                avatar:
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzmicOEJbUJht5qd3CAvzVHhImieubD7oHBg&s",
                text: "I've saved so much money using BukuKita! Instead of buying books I'll only read once, I can now access them for a fraction of the cost.",
              },
              {
                name: "Deka L.",
                avatar:
                  "https://media.licdn.com/dms/image/v2/D5635AQEmYKDu51PcJA/profile-framedphoto-shrink_100_100/B56ZXbW68jHEAk-/0/1743141974080?e=1744347600&v=beta&t=QRWphcp-hUSESJeP4rq44vyFOrzjZVazgpNhUlJDGm4",
                text: "As a book owner, I'm making extra cash from books that were just sitting on my shelf. Plus, I love knowing others are enjoying my favorite stories.",
              },
              {
                name: "Rian F.",
                avatar:
                  "https://media.licdn.com/dms/image/v2/D5635AQE9zIA9ZGo7pQ/profile-framedphoto-shrink_400_400/B56ZXLNkMFHQAk-/0/1742871086111?e=1744347600&v=beta&t=VQCesGJpq7TvSeMZk2ePMtn4j7-ldc-gIdFwED9RaVs",
                text: "The community aspect is what keeps me coming back. I've met so many fellow readers and discovered titles I never would have picked up otherwise.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our service.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How do I list my books for rent?",
                answer:
                  "After creating an account, simply click 'Add Book' from your dashboard. You'll need to provide details about the book, its condition, and set your rental price and terms.",
              },
              {
                question: "How is payment handled?",
                answer:
                  "BukuKita handles all payments securely through our platform. When someone rents your book, we collect payment and hold it until the rental period begins. You'll receive funds directly to your linked account.",
              },
              {
                question: "What if a book is damaged or not returned?",
                answer:
                  "All rentals include a security deposit that covers potential damages. If a book is returned damaged or not returned at all, you'll be compensated from this deposit after our review process.",
              },
              {
                question: "How are book deliveries managed?",
                answer:
                  "BukuKita offers three options: in-person exchange at a public place, doorstep delivery (if both parties are comfortable), or postal delivery with tracking for longer distances.",
              },
              {
                question: "Can I purchase a book I've rented if I love it?",
                answer:
                  "If you fall in love with a book you're renting, you can request to purchase it. If the owner agrees, we'll facilitate the sale and adjust any rental fees already paid.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6">
                    <span className="text-lg font-semibold">
                      {faq.question}
                    </span>
                    <span className="transition group-open:rotate-180">
                      <ChevronDown className="h-6 w-6" />
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get the BukuKita App
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Manage your rentals, chat with book owners, and discover new
                reads on the go. Available for iOS and Android.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={showToastCommingSoon}
                  className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-900 transition"
                >
                  <BookOpen className="h-6 w-6 mr-2" />
                  App Store
                </button>
                <button
                  onClick={showToastCommingSoon}
                  className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-900 transition"
                >
                  <Share2 className="h-6 w-6 mr-2" />
                  Google Play
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-auto transform rotate-12 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={mobile2}
                    alt="BukuKita mobile app"
                    width={290}
                    height={580}
                    className="w-full h-auto"
                  />
                </div>
                <div className="w-64 h-auto transform -rotate-6 absolute -left-20 top-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={mobile1}
                    alt="BukuKita mobile app"
                    width={290}
                    height={580}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section ref={ctaRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Join Our Reading Community?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Create your account today and start saving money while connecting
              with fellow book lovers in your area.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigation("/signup")}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
              >
                Sign Up Now - It's Free!
              </button>
              <button
                onClick={() => navigation("/browse")}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-medium rounded-lg hover:bg-blue-50 transition"
              >
                Browse Books First
              </button>
            </div>
          </div>
        </div>
      </section>

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

export default PublicPage;
