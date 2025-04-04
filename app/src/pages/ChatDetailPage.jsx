// import { ArrowLeft, Send } from "lucide-react";
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router";

// const mockChat = {
//   id: "1",
//   user: {
//     id: "101",
//     name: "John Doe",
//     avatar: "/placeholder.svg?height=50&width=50",
//   },
//   messages: [
//     {
//       id: "m1",
//       text: "Hi, is the book still available?",
//       createdAt: "2023-12-15T14:30:00Z",
//       sender: "user",
//     },
//     {
//       id: "m2",
//       text: "Yes, it's still available. Are you interested in renting it?",
//       createdAt: "2023-12-15T14:32:00Z",
//       sender: "me",
//     },
//     {
//       id: "m3",
//       text: "Great! Yes, I'd like to rent it for a week. Is that possible?",
//       createdAt: "2023-12-15T14:35:00Z",
//       sender: "user",
//     },
//   ],
// };

// export default function ChatDetailPage() {
//   const [newMessage, setNewMessage] = useState("");
//   const [chat, setChat] = useState(mockChat);
//   const [messages, setMessages] = useState(mockChat.messages);
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     const newMsg = {
//       id: `m${messages.length + 1}`,
//       text: newMessage,
//       createdAt: new Date().toISOString(),
//       sender: "me",
//     };

//     setMessages([...messages, newMsg]);

//     setNewMessage("");
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       <header className="md:hidden bg-white p-4 border-b flex items-center">
//         <button
//           onClick={() => navigate(-1)}
//           className="mr-4 border-none bg-transparent cursor-pointer p-1"
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <div className="flex items-center">
//           <div className="relative w-10 h-10 rounded-full overflow-hidden">
//             <img
//               src={chat.user.avatar || "/placeholder.svg"}
//               alt={chat.user.name}
//               fill
//               className="object-cover"
//             />
//           </div>
//           <h1 className="text-lg font-bold ml-3">{chat.user.name}</h1>
//         </div>
//       </header>

//       <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-gray-50 ">
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[75%] rounded-2xl px-4 py-2 ${
//                   message.sender === "me"
//                     ? "bg-[#00A8FF] text-white"
//                     : "bg-white border border-gray-200"
//                 }`}
//               >
//                 <p className="text-sm">{message.text}</p>
//                 <p className="text-xs text-right mt-1 opacity-70">
//                   {new Date(message.createdAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </p>
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
//       </div>
//       <div className="bg-white border-t p-2 sm:p-3 fixed sm:bottom-0 bottom-16 left-0 right-0 w-full">
//         <form onSubmit={handleSendMessage} className="flex items-center">
//           <input
//             type="text"
//             placeholder="Type a message..."
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
//             autoComplete="off"
//           />
//           <button
//             type="submit"
//             disabled={!newMessage.trim()}
//             className="ml-2 bg-[#00A8FF] hover:bg-[#0096e0] text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 p-0 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none touch-manipulation"
//             aria-label="Send message"
//           >
//             <Send size={16} className="sm:size-18" />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { gql, useQuery } from "@apollo/client";
import { io } from "socket.io-client";

// GraphQL queries
const GET_CHAT_MESSAGES = gql`
  query GetChatsByRoomId($roomId: String!) {
    findChatsByRoomId(roomId: $roomId) {
      _id
      sender_id
      receiver_id
      message
      room_id
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

export default function ChatDetailPage() {
  const { id: roomId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);

  // Query to get current user
  const { data: userData } = useQuery(GET_CURRENT_USER);

  // Query to get chat room details
  const {
    loading: roomLoading,
    error: roomError,
    data: roomData,
  } = useQuery(GET_ROOM, {
    variables: { id: roomId },
    skip: !roomId,
  });

  // Query to get chat messages
  const {
    loading: messagesLoading,
    error: messagesError,
    data: messagesData,
  } = useQuery(GET_CHAT_MESSAGES, {
    variables: { roomId },
    skip: !roomId,
    fetchPolicy: "network-only",
  });

  // Set current user when data is available
  useEffect(() => {
    if (userData?.me) {
      setCurrentUser(userData.me);
    }
  }, [userData]);

  // Set chat partner when room data is available
  useEffect(() => {
    if (roomData?.findRoomById && currentUser) {
      const room = roomData.findRoomById;
      // Determine chat partner based on current user
      if (room.user_id === currentUser._id) {
        setChatPartner(room.receiver);
      } else {
        setChatPartner(room.user);
      }
    }
  }, [roomData, currentUser]);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");

    // Connect to Socket.IO server
    socketRef.current = io("http://localhost:4001/");

    // Authenticate with token
    socketRef.current.emit("authenticate", token);

    // Join room when roomId is available
    if (roomId) {
      socketRef.current.emit("join_room", roomId);
    }

    // Listen for new messages
    socketRef.current.on("new_message", (newMessage) => {
      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const exists = prevMessages.some((msg) => msg._id === newMessage._id);
        if (exists) return prevMessages;
        return [...prevMessages, newMessage];
      });
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        if (roomId) {
          socketRef.current.emit("leave_room", roomId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  // Update messages when query data changes
  useEffect(() => {
    if (messagesData?.findChatsByRoomId) {
      setMessages(messagesData.findChatsByRoomId);
    }
  }, [messagesData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    // Handle both string and number timestamps
    let date;
    if (typeof timestamp === "string") {
      // Try to parse as ISO string first
      date = new Date(timestamp);
      // If invalid, try to parse as numeric string
      if (isNaN(date.getTime())) {
        date = new Date(Number.parseInt(timestamp));
      }
    } else {
      // Handle numeric timestamp
      date = new Date(timestamp);
    }

    // Check if date is valid
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
      // Send message via Socket.IO
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
      <header className="bg-white p-4 border-b flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 border-none bg-transparent cursor-pointer p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img
              src={chatPartner?.avatar || "/placeholder.svg?height=40&width=40"}
              alt={chatPartner?.name || "Chat Partner"}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="text-lg font-bold ml-3">
            {chatPartner?.name || "Chat Partner"}
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-gray-50">
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
