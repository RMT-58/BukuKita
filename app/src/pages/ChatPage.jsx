"use client";

import { useState, useEffect, useRef } from "react";
import ChatItem from "../components/ChatItem";
import { Search } from "lucide-react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { io } from "socket.io-client";

// GraphQL queries
const GET_MY_ROOMS = gql`
  query GetMyRooms {
    myRooms {
      _id
      user_id
      receiver_id
      created_at
      updated_at
      unreadCount
      user {
        _id
        name
        username
      }
      receiver {
        _id
        name
        username
      }
      chats {
        _id
        sender_id
        receiver_id
        message
        read
        created_at
      }
    }
  }
`;

const GET_CURRENT_USER = gql`
  query Me {
    me {
      _id
      name
      username
    }
  }
`;

const MARK_MESSAGES_READ = gql`
  mutation MarkMessagesAsRead($roomId: String!) {
    markMessagesAsRead(roomId: $roomId)
  }
`;

const ChatPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const socketRef = useRef(null);
  const [notificationSound] = useState(new Audio("/notification.mp3")); // Add a notification sound file to your public folder

  // Query to get current user
  const { data: userData } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "no-cache",
  });

  // Query to get chat rooms
  const { loading, error, data, refetch } = useQuery(GET_MY_ROOMS);

  // Mutation to mark messages as read
  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_READ);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");

    // Connect to Socket.IO server (now on the same port as GraphQL)
    socketRef.current = io("http://localhost:4000/");

    // Authenticate with token
    socketRef.current.emit("authenticate", token);

    // Listen for new messages
    socketRef.current.on("new_message", () => {
      // Refetch rooms to get the latest data
      refetch();
    });

    // Listen for message notifications
    socketRef.current.on("message_notification", (data) => {
      console.log("Received message notification:", data);

      // Play notification sound
      try {
        notificationSound
          .play()
          .catch((e) => console.log("Error playing notification sound:", e));
      } catch (e) {
        console.log("Error playing notification sound:", e);
      }

      // Refetch rooms to get the latest data
      refetch();
    });

    // Listen for messages being marked as read
    socketRef.current.on("messages_read", () => {
      // Refetch rooms to update unread counts
      refetch();
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [refetch, notificationSound]);

  // Process chat rooms data
  useEffect(() => {
    if (data?.myRooms && userData?.me) {
      const currentUserId = userData.me._id;

      const processedRooms = data.myRooms.map((room) => {
        // Sort chats by date (newest first)
        const sortedChats = [...(room.chats || [])].sort((a, b) => {
          const dateA = new Date(Number(a.created_at) || a.created_at);
          const dateB = new Date(Number(b.created_at) || b.created_at);
          return dateB - dateA;
        });

        // Get the last message
        const lastMessage = sortedChats[0] || null;

        // Determine the chat partner (the other user in the conversation)
        const chatPartner =
          room.user_id === currentUserId ? room.receiver : room.user;

        // Get unread count from the room data
        const unreadCount = room.unreadCount || 0;

        return {
          id: room._id,
          user: {
            id: chatPartner?._id || "unknown",
            name: chatPartner?.name || "Unknown User",
            username: chatPartner?.username || "unknown",
            avatar: "/placeholder.svg?height=50&width=50", // Replace with actual avatar
          },
          lastMessage: lastMessage
            ? {
                text: lastMessage.message,
                createdAt: lastMessage.created_at,
              }
            : {
                text: "No messages yet",
                createdAt: room.created_at,
              },
          unreadCount,
        };
      });

      setChatRooms(processedRooms);
    }
  }, [data, userData]);

  // Filter chats based on search query
  const filteredChats = chatRooms.filter((chat) =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center p-8">
            <p className="text-red-500">Error loading chats: {error.message}</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? "No chats match your search" : "No chats found"}
            </p>
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
