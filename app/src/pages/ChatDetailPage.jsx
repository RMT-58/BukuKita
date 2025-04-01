import { ArrowLeft, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const mockChat = {
  id: "1",
  user: {
    id: "101",
    name: "John Doe",
    avatar: "/placeholder.svg?height=50&width=50",
  },
  messages: [
    {
      id: "m1",
      text: "Hi, is the book still available?",
      createdAt: "2023-12-15T14:30:00Z",
      sender: "user",
    },
    {
      id: "m2",
      text: "Yes, it's still available. Are you interested in renting it?",
      createdAt: "2023-12-15T14:32:00Z",
      sender: "me",
    },
    {
      id: "m3",
      text: "Great! Yes, I'd like to rent it for a week. Is that possible?",
      createdAt: "2023-12-15T14:35:00Z",
      sender: "user",
    },
  ],
};

export default function ChatDetailPage({ params }) {
  const [newMessage, setNewMessage] = useState("");
  const [chat, setChat] = useState(mockChat);
  const [messages, setMessages] = useState(mockChat.messages);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: `m${messages.length + 1}`,
      text: newMessage,
      createdAt: new Date().toISOString(),
      sender: "me",
    };

    setMessages([...messages, newMsg]);

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="md:hidden bg-white p-4 border-b flex items-center">
        <button
          onClick={() => navigate("/")}
          className="mr-4 border-none bg-transparent cursor-pointer p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <img
              src={chat.user.avatar || "/placeholder.svg"}
              alt={chat.user.name}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-lg font-bold ml-3">{chat.user.name}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-gray-50 ">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.sender === "me"
                    ? "bg-[#00A8FF] text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-white border-t p-2 sm:p-3 fixed sm:bottom-0 bottom-16 left-0 right-0 w-full">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="ml-2 bg-[#00A8FF] hover:bg-[#0096e0] text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none touch-manipulation"
            aria-label="Send message"
          >
            <Send size={16} className="sm:size-18" />
          </button>
        </form>
      </div>
    </div>
  );
}
