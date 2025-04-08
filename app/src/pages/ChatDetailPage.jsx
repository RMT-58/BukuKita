"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { gql, useQuery, useMutation } from "@apollo/client";
import { io } from "socket.io-client";
import logo from "../assets/logo.png";

const GET_CHAT_MESSAGES = gql`
  query GetChatsByRoomId($roomId: String!) {
    findChatsByRoomId(roomId: $roomId) {
      _id
      sender_id
      receiver_id
      message
      room_id
      read
      created_at
      updated_at
      sender {
        _id
        name
        username
      }
      receiver {
        _id
        name
        username
      }
    }
  }
`;

const GET_ROOM = gql`
  query GetRoomById($id: ID!) {
    findRoomById(id: $id) {
      _id
      user_id
      receiver_id
      created_at
      updated_at
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

export default function ChatDetailPage() {
  const { id: roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);

  // get current user
  const { data: userData } = useQuery(GET_CURRENT_USER);

  // get chat room details
  const {
    loading: roomLoading,
    error: roomError,
    data: roomData,
  } = useQuery(GET_ROOM, {
    variables: { id: roomId },
    skip: !roomId,
  });

  //  get chat messages
  const {
    loading: messagesLoading,
    error: messagesError,
    data: messagesData,
    refetch: refetchMessages,
  } = useQuery(GET_CHAT_MESSAGES, {
    variables: { roomId },
    skip: !roomId,
    fetchPolicy: "network-only",
  });

  // mark messages as read
  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_READ);

  // SET current user kalau  data  available
  useEffect(() => {
    if (userData?.me) {
      setCurrentUser(userData.me);
    }
  }, [userData]);

  // SET chat partner kalau ada room data
  useEffect(() => {
    if (roomData?.findRoomById && currentUser) {
      const room = roomData.findRoomById;
      // cek chat partner dari current user
      if (room.user_id === currentUser._id) {
        setChatPartner(room.receiver);
      } else {
        setChatPartner(room.user);
      }
    }
  }, [roomData, currentUser]);

  // INIT SOCKET
  useEffect(() => {
    // GET token dari localStorage
    const token = localStorage.getItem("access_token");

    // CONNECT SOCKET server
    socketRef.current = io("http://localhost:4000/");

    // AUTH pakai token
    socketRef.current.emit("authenticate", token);

    // JOINROOM kalau ada roomId
    if (roomId) {
      socketRef.current.emit("join_room", roomId);
    }

    // listen buat new messages
    socketRef.current.on("new_message", (newMessage) => {
      setMessages((prevMessages) => {
        // cek duplikat message
        const exists = prevMessages.some((msg) => msg._id === newMessage._id);
        if (exists) return prevMessages;
        return [...prevMessages, newMessage];
      });

      // messages as read kalau penerima
      if (currentUser && newMessage.receiver_id === currentUser._id) {
        markMessagesAsRead({ variables: { roomId } });
        socketRef.current.emit("mark_messages_read", {
          roomId,
          userId: currentUser._id,
        });
      }
    });

    // CELANUP
    return () => {
      if (socketRef.current) {
        if (roomId) {
          socketRef.current.emit("leave_room", roomId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [roomId, currentUser, markMessagesAsRead]);

  // Update message pas query berubah
  useEffect(() => {
    if (messagesData?.findChatsByRoomId) {
      setMessages(messagesData.findChatsByRoomId);

      // tandain read pas view chat
      if (currentUser && roomId) {
        markMessagesAsRead({ variables: { roomId } });
        socketRef.current.emit("mark_messages_read", {
          roomId,
          userId: currentUser._id,
        });
      }
    }
  }, [messagesData, currentUser, roomId, markMessagesAsRead]);

  // SCROLL kebawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    // handle timestamp
    let date;
    if (typeof timestamp === "string") {
      date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        date = new Date(Number.parseInt(timestamp));
      }
    } else {
      date = new Date(timestamp);
    }

    // cek validasi date
    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      return "Just now";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !currentUser || !chatPartner) return;

    try {
      // SEND MESSAGE SOCKET
      socketRef.current.emit("send_message", {
        room_id: roomId,
        sender_id: currentUser._id,
        receiver_id: chatPartner._id,
        message: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (roomLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (roomError || messagesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>
            Error loading chat: {roomError?.message || messagesError?.message}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 bg-red-200 text-red-800 px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="fixed top-0 sm:top-14 left-0 right-0 bg-white p-4 border-y flex items-center z-10">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 border-none bg-transparent cursor-pointer p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img
              src={chatPartner?.avatar || logo}
              alt={chatPartner?.name || "Chat Partner"}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-lg font-bold ml-3">
            {chatPartner?.name || "Chat Partner"}
          </h1>
        </div>
      </header>

      {/* bodynya */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 mt-8 mb-5 p-8 md:p-12 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender_id === currentUser?._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.sender_id === currentUser?._id
                    ? "bg-[#00A8FF] text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                  {formatTimestamp(message.created_at)}
                  {message.sender_id === currentUser?._id && (
                    <span className="ml-2">{message.read ? "✓✓" : "✓"}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* input barnya fixed */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 bg-white border-t p-2 sm:p-3 z-10">
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
