"use client";

import { useState, useEffect, useRef } from "react";
import ChatItem from "../components/ChatItem";
import { Search } from "lucide-react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { io } from "socket.io-client";
import logo from "../assets/logo.png";

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
  const [notificationSound] = useState(new Audio("/notification.mp3"));

  //GET current user
  const { data: userData } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "no-cache",
  });

  // GET CHAT ROOMS
  const { loading, error, data, refetch } = useQuery(GET_MY_ROOMS, {
    fetchPolicy: "network-only",
  });

  // INIT SOCKET
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    socketRef.current = io("http://localhost:4000/");

    socketRef.current.emit("authenticate", token);

    socketRef.current.on("new_message", () => {
      refetch();
    });

    socketRef.current.on("message_notification", (data) => {
      console.log("Received message notification:", data);

      try {
        notificationSound
          .play()
          .catch((e) => console.log("Error playing notification sound:", e));
      } catch (e) {
        console.log("Error playing notification sound:", e);
      }

      refetch();
    });

    socketRef.current.on("messages_read", () => {
      refetch();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [refetch, notificationSound]);

  // CHATROOM DATA DIPROSES
  useEffect(() => {
    if (data?.myRooms && userData?.me) {
      const currentUserId = userData.me._id;

      const processedRooms = data.myRooms.map((room) => {
        // SORT chat
        const sortedChats = [...(room.chats || [])].sort((a, b) => {
          const dateA = new Date(Number(a.created_at) || a.created_at);
          const dateB = new Date(Number(b.created_at) || b.created_at);
          return dateB - dateA;
        });

        // message terakhir
        const lastMessage = sortedChats[0] || null;

        const chatPartner =
          room.user_id === currentUserId ? room.receiver : room.user;

        const unreadCount = room.unreadCount || 0;

        return {
          id: room._id,
          user: {
            id: chatPartner?._id || "unknown",
            name: chatPartner?.name || "Unknown User",
            username: chatPartner?.username || "unknown",
            avatar: chatPartner?.avatar || logo,
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

  // filter chats dari search query
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
