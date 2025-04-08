import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import LibraryPage from "./pages/LibraryPage";
import AddBookPage from "./pages/AddBookPage";
import ChatPage from "./pages/ChatPage";
import AudioPlayer from "./pages/AudioPlayer";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import CartPage from "./pages/CartPage";
import ChatDetailPage from "./pages/ChatDetailPage";
import BookDetailPage from "./pages/BookDetailPage";
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicPage from "./pages/PublicPage";
import EditBookPage from "./pages/EditBookPage";
import CheckoutPage from "./pages/CheckoutPage";
import { PaymentPage } from "./pages/PaymentPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route path="/public" element={<PublicPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* not found */}
          <Route path="/public/*" element={<NotFound />} />
          <Route path="/login/*" element={<NotFound />} />
          <Route path="/register/*" element={<NotFound />} />
        </Route>

        <Route path="/" element={<PrivateLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/add-book" element={<AddBookPage />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/chats/:id" element={<ChatDetailPage />} />
          <Route path="/player" element={<AudioPlayer />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/book/:bookId" element={<BookDetailPage />} />
          <Route path="/edit-book/:id" element={<EditBookPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* not found */}
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
