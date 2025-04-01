import React, { useState } from "react";
import ChatItem from "../components/ChatItem";
import { Search } from "lucide-react";

const mockChats = [
  {
    id: "1",
    user: {
      id: "101",
      name: "John Doe",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    lastMessage: {
      text: "Hi, is the book still available?",
      createdAt: "2023-12-15T14:30:00Z",
    },
    unreadCount: 2,
  },
  {
    id: "2",
    user: {
      id: "102",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    lastMessage: {
      text: "Thanks for the book recommendation!",
      createdAt: "2023-12-14T09:15:00Z",
    },
    unreadCount: 0,
  },
  {
    id: "3",
    user: {
      id: "103",
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=50&width=50",
    },
    lastMessage: {
      text: "When can I return the book?",
      createdAt: "2023-12-13T18:45:00Z",
    },
    unreadCount: 1,
  },
];

const ChatPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, sestLoading] = useState(false);
  const [error, setError] = useState(null);
  const data = { chats: mockChats };

  const filteredChats =
    data?.chats.filter((chat) =>
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="pb-20 md:pb-0">
      <header className="bg-white p-4 border-b md:hidden">
        <h1 className="text-xl font-bold">Chats</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <p>Loading chats...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8">
            <p className="text-red-500">Error loading chats</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No chats found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatPage;
