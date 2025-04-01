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

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/chats/:id" element={<ChatDetailPage />} />
        <Route path="/player" element={<AudioPlayer />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
